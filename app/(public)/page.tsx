import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="flex min-h-full flex-1 flex-col items-center justify-center gap-8 px-6 py-24">
      <div className="max-w-lg text-center">
        <h1 className="text-3xl font-bold tracking-tight">
          <span className="text-cardinal">USC</span>{" "}
          <span className="text-zinc-900">Assignment Tracker</span>
        </h1>
        <p className="mt-3 text-lg leading-relaxed text-zinc-600">
          Connect your Brightspace calendar and automatically build a personal assignment tracker in Google Sheets — with deadlines, days left, and a completion checklist.
        </p>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-4">
        {user ? (
          <Link
            href="/dashboard"
            className="rounded bg-cardinal px-6 py-3 text-sm font-medium text-white transition hover:bg-red-800"
          >
            Go to dashboard
          </Link>
        ) : (
          <>
            <Link
              href="/sign-in"
              className="rounded bg-cardinal px-6 py-3 text-sm font-medium text-white transition hover:bg-red-800"
            >
              Sign in with Google
            </Link>
            <Link
              href="/dashboard"
              className="rounded border border-zinc-400 bg-white px-6 py-3 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50"
            >
              Set up
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
