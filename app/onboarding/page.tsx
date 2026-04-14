import { createClient } from "@/lib/supabase/server";
import { ICalUrlForm } from "@/components/onboarding/ical-url-form";
import { OnboardingGuide } from "@/components/onboarding/onboarding-guide";
import { CalendarPrefsForm } from "@/components/onboarding/calendar-prefs-form";
import { SyncButton } from "@/components/onboarding/sync-button";

export default async function OnboardingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let isConnected = false;
  let useDedicatedCalendar = true;
  let calendarColorId: string | null = null;

  if (user) {
    const { data } = await supabase
      .from("profiles")
      .select(
        "brightspace_ical_url_ciphertext, use_dedicated_calendar, calendar_color_id",
      )
      .eq("id", user.id)
      .single();

    if (data) {
      isConnected = !!data.brightspace_ical_url_ciphertext;
      useDedicatedCalendar = data.use_dedicated_calendar ?? true;
      calendarColorId = data.calendar_color_id ?? null;
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
            : "Paste your Brightspace iCal URL once. After setup, assignments can sync to Google Calendar."}
        </p>
      </header>

      <OnboardingGuide />

      <ICalUrlForm isConnected={isConnected} />

      {isConnected && (
        <>
          <CalendarPrefsForm
            useDedicatedCalendar={useDedicatedCalendar}
            calendarColorId={calendarColorId}
          />
          <SyncButton />
        </>
      )}
    </div>
  );
}
