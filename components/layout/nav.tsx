import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { SignOutButton } from "./sign-out-button";

export async function Nav() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <header className="border-b-4 border-usc-gold bg-cardinal">
      <nav className="flex w-full items-center justify-between px-6 py-3">
        <Link href="/" className="flex items-baseline gap-0 text-lg font-bold tracking-tight">
          <span className="text-usc-gold">USC</span>
          <span className="text-white"> Assignment Tracker</span>
        </Link>
        <div className="flex items-center gap-6">
          {user ? (
            <>
              <SignOutButton />
            </>
          ) : (
            <Link
              href="/sign-in"
              className="text-sm text-white/80 transition hover:text-white"
            >
              Sign in
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
}
