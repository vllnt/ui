import type { ComponentPlatform } from "@/lib/registry";

export type PlatformContext = ComponentPlatform | undefined;
export type PlatformQuery = Readonly<
  Record<string, readonly string[] | string | undefined>
>;

/** Resolves the URL platform value without inventing state outside the URL. */
export function getPlatform(
  value?: readonly string[] | string,
  fallback: "all" | PlatformContext = "web",
): PlatformContext {
  const candidate = typeof value === "string" ? value : value?.[0];
  if (candidate === "web" || candidate === "native") return candidate;
  return fallback === "all" ? undefined : fallback;
}

/**
 * The one query a prerendered catalog page knows about: its own platform
 * variant. Other query parameters never reach server-rendered links.
 */
export function variantQuery(platform: PlatformContext): PlatformQuery {
  return platform ? { platform } : {};
}

/**
 * The query a shell link (header, sidebar, language switch) carries from the
 * current URL to its target: the `native` platform variant and nothing else.
 * `web` is what a clean URL already shows, so links leave it out. Any other
 * parameter (`component`, `ref`, a crawler's `utm_*`) stays on the page that
 * received it. Carrying everything would copy one stray parameter onto every
 * link and mint an unbounded set of duplicate URLs for crawlers to follow.
 */
export function forwardedParameters(query: URLSearchParams): URLSearchParams {
  const platform = getPlatform(query.get("platform") ?? undefined, "all");

  return platform === "native"
    ? new URLSearchParams({ platform })
    : new URLSearchParams();
}

function appendQuery(
  target: URLSearchParams,
  query: PlatformQuery | URLSearchParams,
) {
  if (query instanceof URLSearchParams) {
    query.forEach((value, key) => {
      target.append(key, value);
    });
    return;
  }

  Object.entries(query).forEach(([key, value]) => {
    if (typeof value === "string") {
      target.append(key, value);
      return;
    }

    value?.forEach((entry) => {
      target.append(key, entry);
    });
  });
}

/**
 * Preserves the current query string while applying an explicit platform.
 * Passing `all` removes the platform key and represents the full catalog.
 */
export function withPlatformQuery(
  href: string,
  query: PlatformQuery | URLSearchParams,
  platform?: "all" | ComponentPlatform,
): string {
  const [pathAndQuery = "", hash = ""] = href.split("#", 2);
  const [pathname = "", hrefQuery = ""] = pathAndQuery.split("?", 2);
  const parameters = new URLSearchParams();
  appendQuery(parameters, query);

  const hrefParameters = new URLSearchParams(hrefQuery);
  hrefParameters.forEach((_value, key) => {
    parameters.delete(key);
  });
  hrefParameters.forEach((value, key) => {
    parameters.append(key, value);
  });

  if (platform === "all") {
    parameters.delete("platform");
  } else if (platform) {
    parameters.set("platform", platform);
  }

  const serialized = parameters.toString();
  return `${pathname}${serialized ? `?${serialized}` : ""}${hash ? `#${hash}` : ""}`;
}

/**
 * The path a page declares as its own URL (canonical, structured data). The
 * `native` variant of a catalog or installation page has its own content,
 * title and sitemap entry, so it keeps `?platform=native`. `web` is what the
 * clean URL already shows, and the unfiltered view is the clean URL, so
 * neither carries a query.
 */
export function canonicalPlatformPath(
  pathname: string,
  platform: PlatformContext,
): string {
  return withPlatformQuery(
    pathname,
    {},
    platform === "native" ? "native" : "all",
  );
}
