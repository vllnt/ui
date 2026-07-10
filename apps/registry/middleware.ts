import { type NextRequest, NextResponse } from "next/server";
import createMiddleware from "next-intl/middleware";

import { routing } from "@/i18n/routing";
import { legacyHostRedirectUrl } from "@/lib/legacy-host-redirect";

const intlMiddleware = createMiddleware(routing);

export default function middleware(request: NextRequest): NextResponse {
  const canonicalUrl = legacyHostRedirectUrl(
    request.headers.get("x-forwarded-host") ??
      request.headers.get("host") ??
      undefined,
    request.nextUrl.pathname,
    request.nextUrl.search,
  );
  if (canonicalUrl) {
    return NextResponse.redirect(canonicalUrl, 301);
  }

  const { pathname } = request.nextUrl;

  // Case-sensitive redirect for the lowercase guess of the design guide.
  // Can't use a route folder (tsc rejects design.md colliding with DESIGN.md)
  // nor next.config redirects() (matches case-insensitively -> loops /DESIGN.md).
  if (pathname === "/design.md") {
    const target = request.nextUrl.clone();
    target.pathname = "/DESIGN.md";

    return NextResponse.redirect(target, 308);
  }

  if (pathname.toLowerCase() === "/design.md") {
    return NextResponse.next();
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: [
    "/design.md",
    "/((?!api|_next|_vercel|mcp|embed|r/|atom\\.xml|rss\\.xml|design\\.txt|llms\\.txt|llms-full\\.txt|sitemap\\.xml|robots\\.txt|manifest\\.webmanifest|.*\\.[^/]+$).*)",
  ],
};
