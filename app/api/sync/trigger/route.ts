import "server-only";
import { createClient } from "@/lib/supabase/server";
import { decryptFromHex } from "@/lib/crypto";
import { NextResponse } from "next/server";

/**
 * Kicks the n8n webhook to trigger a sync for the current user.
 * Decrypts the iCal URL and Google refresh token from the profile and
 * sends them in the payload so n8n doesn't need direct Supabase access.
 * If N8N_WEBHOOK_URL is not set, returns 501 (no-op).
 */
export async function POST() {
  const webhookUrl = process.env.N8N_WEBHOOK_URL;
  if (!webhookUrl) {
    return NextResponse.json(
      { ok: false, message: "Sync trigger is not configured." },
      { status: 501 },
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select(
      "brightspace_ical_url_ciphertext, google_refresh_token_ciphertext",
    )
    .eq("id", user.id)
    .single();

  if (profileError || !profile) {
    return NextResponse.json(
      { ok: false, message: "Profile not found." },
      { status: 404 },
    );
  }

  if (
    !profile.brightspace_ical_url_ciphertext ||
    !profile.google_refresh_token_ciphertext
  ) {
    return NextResponse.json(
      { ok: false, message: "Calendar not fully configured." },
      { status: 400 },
    );
  }

  let icalUrl: string;
  let refreshToken: string;
  try {
    const icalRaw = profile.brightspace_ical_url_ciphertext as string;
    const tokenRaw = profile.google_refresh_token_ciphertext as string;
    console.log("[sync/trigger] ical_raw prefix:", icalRaw?.slice(0, 10));
    console.log("[sync/trigger] token_raw prefix:", tokenRaw?.slice(0, 10));
    icalUrl = decryptFromHex(icalRaw);
    refreshToken = decryptFromHex(tokenRaw);
  } catch (e) {
    console.error("[sync/trigger] decrypt error:", e);
    return NextResponse.json(
      { ok: false, message: "Failed to decrypt credentials." },
      { status: 500 },
    );
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  // Optional: re-enable webhook authentication by setting N8N_WEBHOOK_SECRET.
  if (process.env.N8N_WEBHOOK_SECRET) {
    headers["X-Webhook-Secret"] = process.env.N8N_WEBHOOK_SECRET;
  }

  try {
    const res = await fetch(webhookUrl, {
      method: "POST",
      headers,
      body: JSON.stringify({
        user_id: user.id,
        ical_url: icalUrl,
        refresh_token: refreshToken,
      }),
      cache: "no-store",
    });

    if (!res.ok) {
      const body = await res.text().catch(() => "");
      console.error("[sync/trigger] webhook returned", res.status, body);
      return NextResponse.json(
        { ok: false, message: "Webhook call failed." },
        { status: 502 },
      );
    }
  } catch (e) {
    console.error("[sync/trigger] fetch error:", e);
    return NextResponse.json(
      { ok: false, message: "Could not reach sync service." },
      { status: 502 },
    );
  }

  return NextResponse.json({ ok: true });
}
