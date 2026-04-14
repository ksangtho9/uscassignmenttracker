import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { encryptToHex } from "@/lib/crypto";

function safeNextPath(next: string | null): string {
  if (!next || !next.startsWith("/") || next.startsWith("//")) {
    return "/onboarding";
  }
  return next;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const next = safeNextPath(url.searchParams.get("next"));
  const origin = url.origin;

  if (!code) {
    return NextResponse.redirect(`${origin}/sign-in?error=auth`);
  }

  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        },
      },
    },
  );

  const { data, error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    return NextResponse.redirect(`${origin}/sign-in?error=auth`);
  }

  // Persist the Google refresh token encrypted on the profile.
  // provider_refresh_token is present on first sign-in and whenever
  // the user consents again (we always request prompt=consent).
  const refreshToken = data.session?.provider_refresh_token;
  if (refreshToken && data.session?.user?.id) {
    try {
      await supabase
        .from("profiles")
        .update({
          google_refresh_token_ciphertext: encryptToHex(refreshToken),
        })
        .eq("id", data.session.user.id);
    } catch {
      // Non-fatal: auth still succeeded; token will be captured on next sign-in.
    }
  }

  return NextResponse.redirect(`${origin}${next}`);
}
