import { NextResponse } from "next/server";

/**
 * Reserved for kicking an external sync runner (e.g. n8n). Not implemented in this app.
 */
export async function POST() {
  return NextResponse.json(
    {
      ok: false,
      message:
        "Sync trigger is not implemented in this application. Use your n8n workflow or service role job.",
    },
    { status: 501 },
  );
}
