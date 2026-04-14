import Image from "next/image";

export function OnboardingGuide() {
  return (
    <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
      <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
        Find your Brightspace calendar URL
      </h2>
      <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
        <li>Open Brightspace in another tab.</li>
        <li>Go to Calendar, then Subscribe.</li>
        <li>Copy the subscription URL and paste it below.</li>
      </ol>
      <div className="relative mt-6 aspect-video w-full overflow-hidden rounded-lg bg-zinc-100 dark:bg-zinc-900">
        <Image
          src="/images/onboarding/brightspace-subscribe-placeholder.svg"
          alt="Placeholder for Brightspace Subscribe screenshot"
          fill
          className="object-contain p-8"
          priority
        />
      </div>
    </section>
  );
}
