import { createClient } from "@/lib/supabase/server";
import { ICalUrlForm } from "@/components/onboarding/ical-url-form";
import { CalendarPrefsForm } from "@/components/onboarding/calendar-prefs-form";
import { SyncButton } from "@/components/onboarding/sync-button";

export default async function OnboardingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let isConnected = false;
  let useDedicatedCalendar = true;
  let spreadsheetId: string | null = null;

  if (user) {
    const { data } = await supabase
      .from("profiles")
      .select(
        "brightspace_ical_url_ciphertext, use_dedicated_calendar, google_spreadsheet_id",
      )
      .eq("id", user.id)
      .single();

    if (data) {
      isConnected = !!data.brightspace_ical_url_ciphertext;
      useDedicatedCalendar = data.use_dedicated_calendar ?? true;
      spreadsheetId = data.google_spreadsheet_id ?? null;
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-10 px-6 py-16">
      <header>
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          Connect Brightspace
        </h1>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">
          {isConnected
            ? "Your Brightspace calendar is connected. Paste a new URL below to update it."
            : "Paste your Brightspace iCal URL once. After setup, assignments can sync to Google Calendar and a spreadsheet."}
        </p>
      </header>

      <ICalUrlForm isConnected={isConnected} />

      {isConnected && (
        <>
          <CalendarPrefsForm useDedicatedCalendar={useDedicatedCalendar} />

          {spreadsheetId && (
            <a
              href={`https://docs.google.com/spreadsheets/d/${spreadsheetId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-zinc-300 px-5 py-2.5 text-sm font-medium text-zinc-800 transition hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-900"
            >
              View assignments spreadsheet →
            </a>
          )}

          <SyncButton />
        </>
      )}
    </div>
  );
}
