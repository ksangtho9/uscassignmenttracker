"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Props = {
  isConnected: boolean;
};

type Phase = "idle" | "validating" | "syncing" | "synced" | "error";
type ValidationState = "none" | "valid" | "invalid";

export function ICalUrlForm({ isConnected }: Props) {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [phase, setPhase] = useState<Phase>("idle");
  const [validationState, setValidationState] = useState<ValidationState>("none");
  const [eventCount, setEventCount] = useState<number | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const isBusy = phase === "validating" || phase === "syncing";

  async function validate(urlOverride?: string): Promise<boolean> {
    const target = urlOverride ?? url;
    setPhase("validating");
    setErrorMsg(null);
    try {
      const res = await fetch("/api/onboarding/validate-ical", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: target }),
      });
      const data: unknown = await res.json();
      if (!res.ok || typeof data !== "object" || data === null || !("ok" in data)) {
        setValidationState("invalid");
        setErrorMsg("Could not validate URL.");
        setPhase("error");
        return false;
      }
      const d = data as { ok: boolean; eventCount?: number; error?: string };
      if (d.ok) {
        setEventCount(d.eventCount ?? 0);
        setValidationState("valid");
        setPhase("idle");
        return true;
      } else {
        setValidationState("invalid");
        setErrorMsg(d.error ?? "Invalid feed.");
        setPhase("error");
        return false;
      }
    } catch {
      setValidationState("invalid");
      setErrorMsg("Request failed.");
      setPhase("error");
      return false;
    }
  }

  async function handleSyncNow() {
    setErrorMsg(null);

    // No URL entered and already connected — just trigger sync
    if (!url && isConnected) {
      setPhase("syncing");
      try {
        const res = await fetch("/api/sync/trigger", { method: "POST" });
        const data: unknown = await res.json();
        const ok =
          typeof data === "object" &&
          data !== null &&
          "ok" in data &&
          (data as { ok: boolean }).ok;
        if (ok) {
          setPhase("synced");
          router.refresh();
          setTimeout(() => setPhase("idle"), 3000);
        } else {
          setPhase("error");
          setErrorMsg("Sync failed.");
        }
      } catch {
        setPhase("error");
        setErrorMsg("Request failed.");
      }
      return;
    }

    if (!url) {
      setErrorMsg("Please paste your Brightspace URL first.");
      setPhase("error");
      return;
    }

    // Validate if not already valid
    let isValid = validationState === "valid";
    if (!isValid) {
      isValid = await validate();
      if (!isValid) return;
    }

    // Save URL then trigger sync
    setPhase("syncing");
    try {
      const saveRes = await fetch("/api/onboarding/save-ical", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const saveData: unknown = await saveRes.json();
      if (
        typeof saveData !== "object" ||
        saveData === null ||
        !("ok" in saveData)
      ) {
        setPhase("error");
        setErrorMsg("Failed to save URL.");
        return;
      }
      const sd = saveData as { ok: boolean; error?: string };
      if (!sd.ok) {
        setPhase("error");
        setErrorMsg(sd.error ?? "Failed to save URL.");
        return;
      }

      const syncRes = await fetch("/api/sync/trigger", { method: "POST" });
      const syncData: unknown = await syncRes.json();
      const ok =
        typeof syncData === "object" &&
        syncData !== null &&
        "ok" in syncData &&
        (syncData as { ok: boolean }).ok;
      if (ok) {
        setPhase("synced");
        setUrl("");
        setValidationState("none");
        router.refresh();
        setTimeout(() => setPhase("idle"), 3000);
      } else {
        setPhase("error");
        setErrorMsg("URL saved but sync failed. Try syncing again.");
      }
    } catch {
      setPhase("error");
      setErrorMsg("Request failed.");
    }
  }

  return (
    <div className="flex w-full flex-col gap-3">
      <div className="flex w-full flex-col gap-4 rounded border border-zinc-300 bg-white p-8 shadow-sm">
        {isConnected && !url && phase === "idle" && (
          <p className="text-sm text-zinc-600">
            A calendar URL is already saved. Paste a new one below to replace it.
          </p>
        )}

        <label className="flex flex-col gap-2 text-sm font-medium text-zinc-900">
          Brightspace calendar URL
          <div className="flex gap-2">
            <input
              type="url"
              name="url"
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
                setValidationState("none");
                if (phase === "error" || phase === "synced") setPhase("idle");
              }}
              onPaste={(e) => {
                const pasted = e.clipboardData.getData("text").trim();
                if (pasted.startsWith("https://")) {
                  e.preventDefault();
                  setUrl(pasted);
                  setValidationState("none");
                  void validate(pasted);
                }
              }}
              placeholder="https://…"
              className="flex-1 rounded border border-zinc-300 bg-white px-3 py-2 font-normal text-zinc-900 shadow-sm outline-none ring-zinc-400 focus:ring-2"
            />
            <button
              type="button"
              onClick={() => void validate()}
              disabled={!url || isBusy}
              title="Validate URL"
              className={`rounded border px-3 py-2 text-sm font-bold transition disabled:opacity-40 ${
                validationState === "valid"
                  ? "border-emerald-400 bg-emerald-50 text-emerald-700"
                  : validationState === "invalid"
                    ? "border-red-300 bg-red-50 text-red-700"
                    : "border-zinc-300 bg-white text-zinc-500 hover:bg-zinc-50"
              }`}
            >
              {phase === "validating"
                ? "…"
                : validationState === "valid"
                  ? "✓"
                  : validationState === "invalid"
                    ? "✗"
                    : "✓"}
            </button>
          </div>
        </label>

        {validationState === "valid" && eventCount !== null && (
          <p className="text-sm text-emerald-700">
            Valid — found {eventCount} event{eventCount === 1 ? "" : "s"}.
          </p>
        )}

        <button
          type="button"
          onClick={() => void handleSyncNow()}
          disabled={isBusy}
          className="rounded bg-cardinal px-5 py-2.5 text-sm font-medium text-white transition hover:bg-red-800 disabled:opacity-60"
        >
          {phase === "validating"
            ? "Checking…"
            : phase === "syncing"
              ? "Syncing…"
              : "Sync now"}
        </button>

        {phase === "synced" && (
          <p className="text-sm text-emerald-700" role="status">
            Sync triggered successfully.
          </p>
        )}
        {phase === "error" && errorMsg && (
          <p className="text-sm text-red-700" role="status">
            {errorMsg}
          </p>
        )}
      </div>

      <details className="group w-full">
        <summary className="flex cursor-pointer list-none items-center gap-1 text-xs text-zinc-400 hover:text-zinc-500">
          <span className="inline-block transition-transform group-open:rotate-90">▶</span>
          How do I find my Brightspace URL?
        </summary>
        <ol className="ml-4 mt-2 flex list-decimal flex-col gap-1 text-xs text-zinc-400">
          <li>Log in to Brightspace at <span className="font-medium">d2l.usc.edu</span></li>
          <li>Click <span className="font-medium">Calendar</span> in the top navigation bar</li>
          <li>Click the <span className="font-medium">Subscribe</span> icon (calendar with an arrow)</li>
          <li>Copy the iCal URL and paste it in the field above</li>
        </ol>
      </details>
    </div>
  );
}
