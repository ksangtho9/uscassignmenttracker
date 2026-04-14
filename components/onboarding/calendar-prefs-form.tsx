"use client";

import { useState } from "react";

type Props = {
  useDedicatedCalendar: boolean;
};

export function CalendarPrefsForm({ useDedicatedCalendar: initialDedicated }: Props) {
  const [dedicated, setDedicated] = useState(initialDedicated);
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">(
    "idle",
  );
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function handleSave() {
    setStatus("saving");
    setErrorMsg(null);

    try {
      const res = await fetch("/api/onboarding/save-prefs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          use_dedicated_calendar: dedicated,
          calendar_color_id: null,
        }),
      });

      const data: unknown = await res.json();
      const d =
        typeof data === "object" && data !== null
          ? (data as { ok?: boolean; error?: string })
          : {};

      if (res.ok && d.ok) {
        setStatus("saved");
        setTimeout(() => setStatus("idle"), 2000);
      } else {
        setStatus("error");
        setErrorMsg(d.error ?? "Failed to save.");
      }
    } catch {
      setStatus("error");
      setErrorMsg("Request failed.");
    }
  }

  return (
    <section className="flex flex-col gap-6 rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
      <div>
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
          Calendar settings
        </h2>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Choose where assignment events appear in Google Calendar.
        </p>
      </div>

      <label className="flex cursor-pointer items-start gap-4">
        <span className="relative mt-0.5 inline-flex">
          <input
            type="checkbox"
            className="sr-only"
            checked={dedicated}
            onChange={(e) => setDedicated(e.target.checked)}
          />
          <span
            className={`flex h-6 w-11 items-center rounded-full transition-colors ${
              dedicated
                ? "bg-zinc-900 dark:bg-zinc-100"
                : "bg-zinc-300 dark:bg-zinc-700"
            }`}
          >
            <span
              className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform dark:bg-zinc-900 ${
                dedicated ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </span>
        </span>
        <span className="flex flex-col text-sm">
          <span className="font-medium text-zinc-900 dark:text-zinc-50">
            Create a dedicated Assignments calendar
          </span>
          <span className="text-zinc-500 dark:text-zinc-400">
            {dedicated
              ? "A separate Google Calendar will be created for your assignments."
              : "Assignment events will be added to your primary Google Calendar."}
          </span>
        </span>
      </label>

      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={() => void handleSave()}
          disabled={status === "saving"}
          className="rounded-full bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
        >
          {status === "saving" ? "Saving…" : "Save preferences"}
        </button>
        {status === "saved" && (
          <p className="text-sm text-emerald-700 dark:text-emerald-400" role="status">
            Saved.
          </p>
        )}
        {status === "error" && errorMsg && (
          <p className="text-sm text-red-600 dark:text-red-400" role="status">
            {errorMsg}
          </p>
        )}
      </div>
    </section>
  );
}
