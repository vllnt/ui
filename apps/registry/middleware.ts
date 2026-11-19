import { type NextRequest, NextResponse } from "next/server";
import createMiddleware from "next-intl/middleware";

import { routing } from "@/i18n/routing";
import { legacyHostRedirectUrl } from "@/lib/legacy-host-redirect";
import { markdownPathname, prefersMarkdown } from "@/lib/markdown-negotiation";
import { publicVariant } from "@/lib/platform-variant";
import { variantPathname } from "@/lib/platform-variant-rewrite";

const intlMiddleware = createMiddleware(routing);

function nativeDocsRedirect(request: NextRequest): NextResponse | undefined {
  const { pathname } = request.nextUrl;
  const locale = routing.locales.find(
    (entry) =>
      entry !== routing.defaultLocale && pathname === `/${entry}/docs/native`,
  );
  if (pathname !== "/docs/native" && !locale) return undefined;

  const target = request.nextUrl.clone();
  target.pathname = locale
    ? `/${locale}/docs/installation`
    : "/docs/installation";
  target.searchParams.set("platform", "native");
  return NextResponse.redirect(target, 308);
}

/** Sends a direct hit on a private variant URL to its public form. */
function variantRedirect(request: NextRequest): NextResponse | undefined {
  const target = publicVariant(request.nextUrl.pathname);
  if (!target) return undefined;

  const url = request.nextUrl.clone();
  url.pathname = target.pathname;
  url.searchParams.set("platform", target.platform);

  return NextResponse.redirect(url, 308);
}

/**
 * Prerendered pages cannot read `?platform=`, so the middleware rewrites a
 * platform query to the prerendered copy for that platform. Redirects pass through.
 */
function platformVariant(
  request: NextRequest,
  response: NextResponse,
): NextResponse {
  const variant = variantPathname(
    request.nextUrl.pathname,
    request.nextUrl.searchParams.get("platform") ?? undefined,
  );
  if (!variant || response.headers.has("location")) return response;

  const rewritten = NextResponse.rewrite(new URL(variant, request.url));
  response.headers.forEach((value, key) => {
    if (!key.startsWith("x-middleware-")) rewritten.headers.set(key, value);
  });

  return rewritten;
}

const VARY_ON_ACCEPT = new Headers([["Vary", "Accept"]]);

/**
 * A page with a markdown twin answers `Accept: text/markdown` with the twin at
 * the same URL, and the answer says it varies by `Accept`.
 */
function markdownTwin(request: NextRequest): NextResponse | undefined {
  if (request.method !== "GET" && request.method !== "HEAD") return undefined;
  if (!prefersMarkdown(request.headers.get("accept"))) return undefined;
  const target = markdownPathname(request.nextUrl.pathname);
  if (!target) return undefined;

  return NextResponse.rewrite(new URL(target, request.url), {
    headers: VARY_ON_ACCEPT,
  });
}

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

  const nativeRedirect = nativeDocsRedirect(request);
  if (nativeRedirect) return nativeRedirect;

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

  const answer = variantRedirect(request) ?? markdownTwin(request);
  if (answer) return answer;

  const response = intlMiddleware(request);
  /**
   * next-intl sets NEXT_LOCALE on any document request whose locale differs
   * from Accept-Language, which includes every crawler. Public GETs must stay
   * cookie-free so a CDN can cache them; the language switcher writes the cookie
   * in the browser when a visitor picks a language. The cookie travels in two
   * headers: `set-cookie` on the response, and `x-middleware-set-cookie`, which
   * Next re-emits as `set-cookie` on whatever route answers after the middleware
   * (a page that redirects, for example).
   */
  response.headers.delete("set-cookie");
  response.headers.delete("x-middleware-set-cookie");

  return platformVariant(request, response);
}

export const config = {
  matcher: [
    "/design.md",
    "/((?!api|healthz|_next|_vercel|mcp|embed|r/|\\.well-known/|atom\\.xml|rss\\.xml|design\\.txt|llms\\.txt|llms-full\\.txt|sitemap\\.xml|robots\\.txt|manifest\\.webmanifest|.*\\.[^/]+$).*)",
  ],
};
