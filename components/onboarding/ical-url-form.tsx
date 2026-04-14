"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Props = {
  isConnected: boolean;
};

type Phase = "input" | "validated" | "saving" | "saved" | "error";

export function ICalUrlForm({ isConnected }: Props) {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [phase, setPhase] = useState<Phase>("input");
  const [eventCount, setEventCount] = useState<number | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [validating, setValidating] = useState(false);

  async function handleValidate(e: React.FormEvent) {
    e.preventDefault();
    setValidating(true);
    setErrorMsg(null);
    setPhase("input");

    try {
      const res = await fetch("/api/onboarding/validate-ical", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const data: unknown = await res.json();

      if (
        !res.ok ||
        typeof data !== "object" ||
        data === null ||
        !("ok" in data)
      ) {
        setPhase("error");
        setErrorMsg("Could not validate URL.");
        return;
      }

      const d = data as { ok: boolean; eventCount?: number; error?: string };
      if (d.ok) {
        setEventCount(d.eventCount ?? 0);
        setPhase("validated");
      } else {
        setPhase("error");
        setErrorMsg(d.error ?? "Invalid feed.");
      }
    } catch {
      setPhase("error");
      setErrorMsg("Request failed.");
    } finally {
      setValidating(false);
    }
  }

  async function handleSave() {
    setPhase("saving");
    setErrorMsg(null);

    try {
      const res = await fetch("/api/onboarding/save-ical", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const data: unknown = await res.json();

      if (typeof data !== "object" || data === null || !("ok" in data)) {
        setPhase("error");
        setErrorMsg("Failed to save.");
        return;
      }

      const d = data as { ok: boolean; eventCount?: number; error?: string };
      if (d.ok) {
        setEventCount(d.eventCount ?? eventCount);
        setPhase("saved");
        // Re-render the server component so the calendar prefs section appears.
        router.refresh();
      } else {
        setPhase("error");
        setErrorMsg(d.error ?? "Failed to save.");
      }
    } catch {
      setPhase("error");
      setErrorMsg("Request failed.");
    }
  }

  if (phase === "saved") {
    return (
      <div className="flex flex-col gap-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-6 dark:border-emerald-800 dark:bg-emerald-950">
        <p className="text-sm font-medium text-emerald-800 dark:text-emerald-300">
          Brightspace connected — found {eventCount} assignment
          {eventCount === 1 ? "" : "s"} in your calendar.
        </p>
        <button
          type="button"
          onClick={() => {
            setPhase("input");
            setUrl("");
            setEventCount(null);
          }}
          className="self-start text-sm text-zinc-500 underline underline-offset-2 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
        >
          Update URL
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <form
        onSubmit={(e) => void handleValidate(e)}
        className="flex flex-col gap-4 rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950"
      >
        {isConnected && phase === "input" && (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            A calendar URL is already saved. Paste a new one below to replace
            it.
          </p>
        )}
        <label className="flex flex-col gap-2 text-sm font-medium text-zinc-900 dark:text-zinc-50">
          Brightspace calendar URL
          <input
            type="url"
            name="url"
            value={url}
            onChange={(e) => {
              setUrl(e.target.value);
              if (phase !== "input") setPhase("input");
            }}
            placeholder="https://…"
            required
            className="rounded-lg border border-zinc-300 bg-white px-3 py-2 font-normal text-zinc-900 shadow-sm outline-none ring-zinc-400 focus:ring-2 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
          />
        </label>
        <button
          type="submit"
          disabled={validating}
          className="rounded-full bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
        >
          {validating ? "Checking…" : "Validate feed"}
        </button>

        {phase === "validated" && eventCount !== null && (
          <p className="text-sm text-emerald-700 dark:text-emerald-400" role="status">
            Valid feed — found {eventCount} event{eventCount === 1 ? "" : "s"}.
          </p>
        )}

        {phase === "error" && errorMsg && (
          <p className="text-sm text-red-600 dark:text-red-400" role="status">
            {errorMsg}
          </p>
        )}
      </form>

      {phase === "validated" && (
        <button
          type="button"
          onClick={() => void handleSave()}
          className="rounded-full bg-emerald-700 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-emerald-600 dark:bg-emerald-600 dark:hover:bg-emerald-500"
        >
          Save & connect
        </button>
      )}

      {phase === "saving" && (
        <p className="text-sm text-zinc-500 dark:text-zinc-400">Saving…</p>
      )}
    </div>
  );
}
