import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { SignOutButton } from "./sign-out-button";

export async function Nav() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <header className="border-b border-zinc-200 dark:border-zinc-800">
      <nav className="mx-auto flex max-w-2xl items-center justify-between px-6 py-4">
        <Link
          href="/"
          className="text-sm font-medium text-zinc-900 dark:text-zinc-50"
        >
          USC Assignment Tracker
        </Link>
        <div className="flex items-center gap-6">
          {user ? (
            <>
              <Link
                href="/onboarding"
                className="text-sm text-zinc-500 transition hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
              >
                Settings
              </Link>
              <SignOutButton />
            </>
          ) : (
            <Link
              href="/sign-in"
              className="text-sm text-zinc-500 transition hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
            >
              Sign in
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
}
