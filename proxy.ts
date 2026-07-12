import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { RESERVED_SUBDOMAINS } from "@/lib/reserved-subdomains";

/**
 * Two jobs, in order:
 *  1. Tenant resolution — `{sub}.{ROOT_DOMAIN}/…` is rewritten to `/s/{sub}/…`.
 *     Tenant traffic skips session refresh entirely so published pages stay
 *     cookie-free and cacheable.
 *  2. Supabase session refresh for apex traffic (marketing + dashboard).
 */
export async function proxy(request: NextRequest) {
  const host = (request.headers.get("host") ?? "").toLowerCase();
  const rootDomain = (process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? "").toLowerCase();
  const { pathname } = request.nextUrl;

  if (
    rootDomain &&
    host !== rootDomain &&
    host !== `www.${rootDomain}` &&
    host.endsWith(`.${rootDomain}`)
  ) {
    const subdomain = host.slice(0, -(rootDomain.length + 1));
    if (!subdomain.includes(".") && !RESERVED_SUBDOMAINS.has(subdomain)) {
      // Tenant host must not also serve /s/* paths (duplicate content).
      if (pathname === "/s" || pathname.startsWith("/s/")) {
        return NextResponse.redirect(new URL("/", request.url));
      }
      const url = request.nextUrl.clone();
      url.pathname = `/s/${subdomain}${pathname === "/" ? "" : pathname}`;
      const requestHeaders = new Headers(request.headers);
      requestHeaders.set("x-tenant-subdomain", subdomain);
      return NextResponse.rewrite(url, {
        request: { headers: requestHeaders },
      });
    }
  }

  return refreshSession(request);
}

async function refreshSession(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.next({ request });
  }

  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value),
        );
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options),
        );
      },
    },
  });

  // Revalidates the auth token and re-issues cookies when needed.
  await supabase.auth.getUser();

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif|ico|css|js|txt|xml|map|woff2?)$).*)",
  ],
};
