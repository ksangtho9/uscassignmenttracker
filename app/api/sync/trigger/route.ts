import "server-only";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

/**
 * Kicks the n8n webhook to trigger a sync for the current user.
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

  try {
    const res = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: user.id }),
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
