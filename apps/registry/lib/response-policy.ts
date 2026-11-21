/**
 * HTTP caching rules for every answer the middleware gives: pages, React
 * Server Component (RSC) payloads and redirects.
 *
 * Next derives `Cache-Control` from each route's `revalidate`, with a one-year
 * `stale-while-revalidate` (its default `expireTime`) and a one-year `s-maxage`
 * on fully static pages. A shared cache could then serve, for up to a year,
 * HTML that points at script chunks a newer deploy has removed. Next fills
 * `Cache-Control` when nothing set it earlier, so the value set here wins.
 *
 * Next removes the router headers (`rsc`, `next-router-*`) and the `_rsc`
 * query from the request before the middleware sees it, so those cannot mark an
 * RSC fetch. `Accept` can: a browser asks for `text/html` on every page load,
 * and the router's fetches never do. A request for HTML is the one kind whose
 * answer a shared cache may keep.
 */

/** Pages asked for as HTML: browsers revalidate on every visit; a shared cache may keep a copy 5 minutes. */
export const DOCUMENT_CACHE_CONTROL =
  "public, max-age=0, s-maxage=300, stale-while-revalidate=60";

/**
 * Everything else is never stored: RSC payloads (and Next's own redirect that
 * adds `_rsc`) share their URL path with the page, and a redirect can depend
 * on the language cookie.
 */
export const UNCACHED = "private, no-store";

/** The request headers Next's router sends; the answer depends on each of them. */
export const NEXT_ROUTER_VARY = [
  "rsc",
  "next-router-state-tree",
  "next-router-prefetch",
  "next-router-segment-prefetch",
] as const;

/** Whether the request asks for an HTML page, as a browser page load does. */
export function acceptsHtml(headers: Headers): boolean {
  return /\btext\/html\b/i.test(headers.get("accept") ?? "");
}

/**
 * Adds names to a `Vary` header without dropping the ones already there.
 *
 * @param current - the existing `Vary` value, if any
 * @param names - header names to add
 * @returns the merged value, each name once, in first-seen order
 * @example
 * mergeVary("Accept", ["rsc", "accept"]); // "Accept, rsc"
 */
export function mergeVary(
  current: null | string | undefined,
  names: readonly string[],
): string {
  const unique = [...(current ?? "").split(","), ...names]
    .map((name) => name.trim())
    .filter(Boolean)
    .reduce((seen, name) => {
      const key = name.toLowerCase();

      return seen.has(key) ? seen : seen.set(key, name);
    }, new Map<string, string>());

  return [...unique.values()].join(", ");
}

type PolicyOptions = {
  /** The URL also serves markdown for `Accept: text/markdown`. */
  readonly hasMarkdownTwin: boolean;
  /** The response is the markdown twin, whose route sets its own private Cache-Control. */
  readonly isMarkdownTwin?: boolean;
};

/**
 * Sets `Vary` and `Cache-Control` on a middleware response, in place.
 *
 * A page asked for as HTML gets the short document policy; redirects and
 * everything else (RSC payloads) are never stored. Every answer lists the router headers and, when the URL has a
 * markdown twin, `Accept`, so no cache hands one form of the URL to a request
 * that asked for another.
 *
 * Next replaces `Vary` on page responses with its own router list, so the
 * `Accept` added here survives on redirects and the markdown twin, not on HTML.
 *
 * @param request - the incoming request headers
 * @param response - the response to update
 * @param options - what the URL can serve
 * @returns the same response
 */
export function applyResponsePolicy<T extends { headers: Headers }>(
  request: { readonly headers: Headers },
  response: T,
  { hasMarkdownTwin, isMarkdownTwin = false }: PolicyOptions,
): T {
  const { headers } = response;
  headers.set(
    "Vary",
    mergeVary(headers.get("vary"), [
      ...NEXT_ROUTER_VARY,
      ...(hasMarkdownTwin ? ["Accept"] : []),
    ]),
  );
  if (isMarkdownTwin) return response;
  const isRedirect = headers.has("location");
  headers.set(
    "Cache-Control",
    !isRedirect && acceptsHtml(request.headers)
      ? DOCUMENT_CACHE_CONTROL
      : UNCACHED,
  );

  return response;
}
