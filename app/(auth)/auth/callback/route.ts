import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Public origin of the request. Hosts that terminate TLS in front of the app
 * (Netlify among them) can hand the handler an internal request URL, so the
 * forwarded headers win when present — otherwise the redirect lands on the
 * wrong host after sign-in.
 */
function publicOrigin(request: Request): string {
  const url = new URL(request.url);
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  if (!host) return url.origin;
  const proto =
    request.headers.get("x-forwarded-proto") ?? url.protocol.replace(":", "");
  return `${proto}://${host}`;
}

/** OAuth / email-confirmation code exchange. */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const origin = publicOrigin(request);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(
    `${origin}/login?error=Could not sign you in. Please try again.`,
  );
}
