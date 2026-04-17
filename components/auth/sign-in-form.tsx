"use client";

import { createClient } from "@/lib/supabase/client";

type SignInFormProps = {
  nextPath: string;
};

export function SignInForm({ nextPath }: SignInFormProps) {
  async function signInWithGoogle() {
    const supabase = createClient();
    const origin = window.location.origin;
    const redirectTo = `${origin}/auth/callback?next=${encodeURIComponent(nextPath)}`;
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo,
        scopes:
          "https://www.googleapis.com/auth/calendar.events https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/spreadsheets",
        queryParams: {
          access_type: "offline",
          prompt: "consent",
        },
      },
    });
  }

  return (
    <div className="mx-auto flex max-w-md flex-col gap-6 px-6 py-16">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900">Sign in</h1>
        <p className="mt-2 text-sm text-zinc-600">
          Google Calendar and Sheets access is used to create assignment events and a personal tracking spreadsheet.
        </p>
      </div>
      <button
        type="button"
        onClick={() => void signInWithGoogle()}
        className="rounded bg-cardinal px-5 py-3 text-sm font-medium text-white transition hover:bg-red-800"
      >
        Sign in with Google
      </button>
    </div>
  );
}
