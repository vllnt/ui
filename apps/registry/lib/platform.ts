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
