import "server-only";
import { createClient } from "@/lib/supabase/server";
import { validateICalFeed } from "@/lib/ical/validate";
import { encryptToHex } from "@/lib/crypto";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const url =
    typeof body === "object" &&
    body !== null &&
    "url" in body &&
    typeof (body as { url: unknown }).url === "string"
      ? (body as { url: string }).url.trim()
      : "";

  if (!url) {
    return NextResponse.json({ error: "Missing url." }, { status: 400 });
  }

  const result = await validateICalFeed(url);
  if (!result.ok) {
    return NextResponse.json({ ok: false, error: result.error }, { status: 422 });
  }

  const { error: dbError } = await supabase
    .from("profiles")
    .update({ brightspace_ical_url_ciphertext: encryptToHex(url) })
    .eq("id", user.id);

  if (dbError) {
    return NextResponse.json(
      { ok: false, error: "Failed to save calendar URL." },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true, eventCount: result.eventCount });
}
