"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function SyncButton() {
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "syncing" | "done" | "error">(
    "idle",
  );

  async function handleSync() {
    setStatus("syncing");

    try {
      const res = await fetch("/api/sync/trigger", { method: "POST" });
      const data: unknown = await res.json();
      const ok =
        typeof data === "object" &&
        data !== null &&
        "ok" in data &&
        (data as { ok: boolean }).ok === true;

      if (ok) {
        setStatus("done");
        // Re-render server component so the spreadsheet link appears once n8n sets it.
        router.refresh();
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    } finally {
      setTimeout(() => setStatus("idle"), 3000);
    }
  }

  return (
    <div className="flex items-center gap-4">
      <button
        type="button"
        onClick={() => void handleSync()}
        disabled={status === "syncing"}
        className="rounded-full border border-zinc-300 px-5 py-2.5 text-sm font-medium text-zinc-800 transition hover:bg-zinc-100 disabled:opacity-60 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-900"
      >
        {status === "syncing" ? "Syncing…" : "Sync now"}
      </button>
      {status === "done" && (
        <p className="text-sm text-emerald-700 dark:text-emerald-400" role="status">
          Sync triggered.
        </p>
      )}
      {status === "error" && (
        <p className="text-sm text-red-600 dark:text-red-400" role="status">
          Sync failed. Try again.
        </p>
      )}
    </div>
  );
}
