"use client";

import { useForwardedQuery } from "@/components/forwarded-query";
import { getPlatform, withPlatformQuery } from "@/lib/platform";

const NO_QUERY = new URLSearchParams();

/**
 * What the header's links share: the platform variant the visitor chose, and a
 * function that keeps it on a link. The query exists in the browser after
 * hydration, so the prerendered HTML carries the plain links and the query
 * joins them in place.
 */
export function usePreservedQuery() {
  const searchParameters = useForwardedQuery() ?? NO_QUERY;
  const activePlatform = getPlatform(
    searchParameters.get("platform") ?? undefined,
  );

  return {
    activePlatform,
    preserveQuery: (href: string) => withPlatformQuery(href, searchParameters),
  };
}
