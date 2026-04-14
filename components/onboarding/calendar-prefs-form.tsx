"use client";

import { useState } from "react";

// Google Calendar event color IDs (colorId 1–11) with display names and hex values.
const COLORS = [
  { id: "1", name: "Lavender", hex: "#7986CB" },
  { id: "2", name: "Sage", hex: "#33B679" },
  { id: "3", name: "Grape", hex: "#8E24AA" },
  { id: "4", name: "Flamingo", hex: "#E67C73" },
  { id: "5", name: "Banana", hex: "#F6BF26" },
  { id: "6", name: "Tangerine", hex: "#F4511E" },
  { id: "7", name: "Peacock", hex: "#039BE5" },
  { id: "8", name: "Graphite", hex: "#616161" },
  { id: "9", name: "Blueberry", hex: "#3F51B5" },
  { id: "10", name: "Basil", hex: "#0B8043" },
  { id: "11", name: "Tomato", hex: "#D50000" },
] as const;

type Props = {
  useDedicatedCalendar: boolean;
  calendarColorId: string | null;
};

export function CalendarPrefsForm({
  useDedicatedCalendar: initialDedicated,
  calendarColorId: initialColorId,
}: Props) {
  const [dedicated, setDedicated] = useState(initialDedicated);
  const [colorId, setColorId] = useState<string | null>(initialColorId);
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
          calendar_color_id: dedicated ? colorId : null,
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

      {/* Dedicated calendar toggle */}
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

      {/* Color picker — only shown when dedicated calendar is on */}
      {dedicated && (
        <div className="flex flex-col gap-3">
          <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
            Calendar color{" "}
            <span className="font-normal text-zinc-500 dark:text-zinc-400">
              (optional)
            </span>
          </p>
          <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Calendar color">
            {COLORS.map((c) => {
              const selected = colorId === c.id;
              return (
                <button
                  key={c.id}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  aria-label={c.name}
                  title={c.name}
                  onClick={() => setColorId(selected ? null : c.id)}
                  className={`relative flex h-8 w-8 items-center justify-center rounded-full transition-shadow focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${
                    selected
                      ? "ring-2 ring-offset-2 ring-zinc-900 dark:ring-zinc-100"
                      : "hover:scale-110"
                  }`}
                  style={{ backgroundColor: c.hex }}
                >
                  {selected && (
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      strokeWidth={3}
                      stroke="white"
                      className="h-4 w-4"
                      aria-hidden
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  )}
                </button>
              );
            })}
          </div>
          {colorId && (
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              {COLORS.find((c) => c.id === colorId)?.name} selected.{" "}
              <button
                type="button"
                onClick={() => setColorId(null)}
                className="underline underline-offset-2 hover:text-zinc-700 dark:hover:text-zinc-300"
              >
                Clear
              </button>
            </p>
          )}
        </div>
      )}

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
