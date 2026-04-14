"use client";

import { useState } from "react";

export function ICalUrlForm() {
  const [url, setUrl] = useState("");
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setMessage(null);
    try {
      const res = await fetch("/api/onboarding/validate-ical", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const data: unknown = await res.json();
      if (!res.ok || typeof data !== "object" || data === null) {
        setStatus("error");
        setMessage("Could not validate URL.");
        return;
      }
      const ok = "ok" in data && (data as { ok?: boolean }).ok === true;
      if (ok && "eventCount" in data) {
        setStatus("success");
        setMessage(
          `Valid iCal feed. Found ${String((data as { eventCount: number }).eventCount)} events.`,
        );
        return;
      }
      const err =
        "error" in data && typeof (data as { error?: unknown }).error === "string"
          ? (data as { error: string }).error
          : "Invalid feed.";
      setStatus("error");
      setMessage(err);
    } catch {
      setStatus("error");
      setMessage("Request failed.");
    }
  }

  return (
    <form
      onSubmit={(e) => void handleSubmit(e)}
      className="flex flex-col gap-4 rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950"
    >
      <label className="flex flex-col gap-2 text-sm font-medium text-zinc-900 dark:text-zinc-50">
        Brightspace calendar URL
        <input
          type="url"
          name="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://…"
          required
          className="rounded-lg border border-zinc-300 bg-white px-3 py-2 font-normal text-zinc-900 shadow-sm outline-none ring-zinc-400 focus:ring-2 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
        />
      </label>
      <button
        type="submit"
        disabled={status === "loading"}
        className="rounded-full bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
      >
        {status === "loading" ? "Checking…" : "Validate feed"}
      </button>
      {message ? (
        <p
          className={
            status === "success"
              ? "text-sm text-emerald-700 dark:text-emerald-400"
              : "text-sm text-red-600 dark:text-red-400"
          }
          role="status"
        >
          {message}
        </p>
      ) : null}
    </form>
  );
}
