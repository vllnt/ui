import { type NextRequest, NextResponse } from "next/server";
import createMiddleware from "next-intl/middleware";

import { routing } from "@/i18n/routing";
import { legacyHostRedirectUrl } from "@/lib/legacy-host-redirect";
import { markdownPathname, prefersMarkdown } from "@/lib/markdown-negotiation";
import { publicVariant } from "@/lib/platform-variant";
import { variantPathname } from "@/lib/platform-variant-rewrite";
import { renamedComponentRedirect } from "@/lib/renamed-components";
import { applyResponsePolicy } from "@/lib/response-policy";

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

/** A permanent redirect for a page that moved: a renamed component or a private variant URL. */
function movedPage(request: NextRequest): NextResponse | undefined {
  return renamedComponentRedirect(request) ?? variantRedirect(request);
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

/**
 * A page with a markdown twin answers `Accept: text/markdown` with the twin at
 * the same URL, and the answer says it varies by `Accept`.
 */
function markdownTwin(request: NextRequest): NextResponse | undefined {
  if (request.method !== "GET" && request.method !== "HEAD") return undefined;
  if (!prefersMarkdown(request.headers.get("accept"))) return undefined;
  const target = markdownPathname(request.nextUrl.pathname);
  if (!target) return undefined;

  return NextResponse.rewrite(new URL(target, request.url));
}

/** Whether the middleware answered with the markdown twin of the page. */
function isMarkdownRewrite(response: NextResponse): boolean {
  const target = response.headers.get("x-middleware-rewrite");

  return target !== null && new URL(target).pathname.startsWith("/md/");
}

/** Every answer goes through the caching rules in `@/lib/response-policy`. */
export default function middleware(request: NextRequest): NextResponse {
  const { pathname } = request.nextUrl;
  // Any other casing of /design.md is the route handler's own answer.
  if (pathname !== "/design.md" && pathname.toLowerCase() === "/design.md") {
    return NextResponse.next();
  }
  const answer = pathname.startsWith("/embed/")
    ? NextResponse.next()
    : route(request);

  return applyResponsePolicy(request, answer, {
    hasMarkdownTwin: Boolean(markdownPathname(pathname)),
    isMarkdownTwin: isMarkdownRewrite(answer),
  });
}

function route(request: NextRequest): NextResponse {
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

  const answer = movedPage(request) ?? markdownTwin(request);
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
    "/embed/:path*",
    "/((?!api|healthz|_next|_vercel|mcp|embed|apple-icon|r/|\\.well-known/|atom\\.xml|rss\\.xml|design\\.txt|llms\\.txt|llms-full\\.txt|sitemap\\.xml|robots\\.txt|manifest\\.webmanifest|.*\\.[^/]+$).*)",
  ],
};
