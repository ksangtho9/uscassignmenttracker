import { ICalUrlForm } from "@/components/onboarding/ical-url-form";
import { OnboardingGuide } from "@/components/onboarding/onboarding-guide";

export default function OnboardingPage() {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-10 px-6 py-16">
      <header>
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          Connect Brightspace
        </h1>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">
          Paste your Brightspace iCal URL once. After setup, assignments can sync
          to Google Calendar.
        </p>
      </header>
      <OnboardingGuide />
      <ICalUrlForm />
    </div>
  );
}
