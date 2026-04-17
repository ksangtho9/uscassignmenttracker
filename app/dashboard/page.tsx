import { createClient } from "@/lib/supabase/server";
import { ICalUrlForm } from "@/components/onboarding/ical-url-form";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let isConnected = false;
  let spreadsheetId: string | null = null;

  if (user) {
    const { data } = await supabase
      .from("profiles")
      .select("brightspace_ical_url_ciphertext, google_spreadsheet_id")
      .eq("id", user.id)
      .single();

    if (data) {
      isConnected = !!data.brightspace_ical_url_ciphertext;
      spreadsheetId = data.google_spreadsheet_id ?? null;
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col items-center gap-6 px-6 py-16 text-center">
      <header>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
          {isConnected ? "Dashboard" : "Get started"}
        </h1>
        <p className="mt-2 text-sm text-zinc-600">
          {isConnected
            ? "Sync your Brightspace assignments to Google Calendar and your spreadsheet."
            : "Connect your Brightspace calendar to start syncing assignments."}
        </p>
      </header>

      <ICalUrlForm isConnected={isConnected} />

      {isConnected && spreadsheetId && (
        <a
          href={`https://docs.google.com/spreadsheets/d/${spreadsheetId}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded border border-cardinal bg-white px-5 py-2.5 text-sm font-medium text-cardinal shadow-sm transition hover:bg-red-50"
        >
          View assignments spreadsheet →
        </a>
      )}
    </div>
  );
}
