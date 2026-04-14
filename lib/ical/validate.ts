import ICAL from "ical.js";

export type ValidateICalFeedResult =
  | { ok: true; eventCount: number }
  | { ok: false; error: string };

const FETCH_TIMEOUT_MS = 30_000;

/**
 * Fetches an iCal feed once, parses it, and returns the number of VEVENTs.
 * Used during onboarding to confirm the Brightspace URL is valid.
 */
export async function validateICalFeed(
  url: string,
): Promise<ValidateICalFeedResult> {
  let parsedUrl: URL;
  try {
    parsedUrl = new URL(url);
  } catch {
    return { ok: false, error: "Invalid URL." };
  }

  if (!["http:", "https:"].includes(parsedUrl.protocol)) {
    return { ok: false, error: "URL must use http or https." };
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const response = await fetch(parsedUrl.toString(), {
      signal: controller.signal,
      headers: {
        Accept: "text/calendar, text/plain, */*",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      return {
        ok: false,
        error: `Feed returned ${response.status} ${response.statusText}.`,
      };
    }

    const text = await response.text();
    if (!text.trim()) {
      return { ok: false, error: "Empty response from feed URL." };
    }

    let root: InstanceType<typeof ICAL.Component>;
    try {
      root = ICAL.Component.fromString(text);
    } catch {
      return { ok: false, error: "Response is not valid iCalendar data." };
    }

    const events = root.getAllSubcomponents("vevent");

    return { ok: true, eventCount: events.length };
  } catch (e) {
    if (e instanceof Error && e.name === "AbortError") {
      return { ok: false, error: "Request timed out." };
    }
    return {
      ok: false,
      error: "Could not fetch or parse the calendar feed.",
    };
  } finally {
    clearTimeout(timeout);
  }
}
