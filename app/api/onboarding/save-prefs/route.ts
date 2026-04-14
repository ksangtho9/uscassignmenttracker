import "server-only";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

const VALID_COLOR_IDS = new Set([
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "10",
  "11",
]);

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

  if (typeof body !== "object" || body === null) {
    return NextResponse.json({ error: "Invalid body." }, { status: 400 });
  }

  const b = body as Record<string, unknown>;

  if (typeof b.use_dedicated_calendar !== "boolean") {
    return NextResponse.json(
      { error: "use_dedicated_calendar must be a boolean." },
      { status: 400 },
    );
  }

  const colorId =
    typeof b.calendar_color_id === "string" ? b.calendar_color_id : null;

  if (colorId !== null && !VALID_COLOR_IDS.has(colorId)) {
    return NextResponse.json(
      { error: "Invalid calendar_color_id." },
      { status: 400 },
    );
  }

  const { error: dbError } = await supabase
    .from("profiles")
    .update({
      use_dedicated_calendar: b.use_dedicated_calendar,
      calendar_color_id: colorId,
    })
    .eq("id", user.id);

  if (dbError) {
    return NextResponse.json(
      { ok: false, error: "Failed to save preferences." },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true });
}
