import { type NextRequest, NextResponse } from "next/server";

import { splitLocale } from "@/lib/platform-variant";

/**
 * Component pages that moved: old slug to new slug. The registry keeps a
 * deprecated item under the old slug for one release so installs keep working;
 * the old page redirects permanently to the new one.
 */
export const RENAMED_COMPONENTS: ReadonlyMap<string, string> = new Map([
  ["jarvis-dock", "command-dock"],
]);

const COMPONENT_PAGE = /^\/components\/([^/]+)$/;

/**
 * Pathname of the page a renamed component moved to.
 *
 * @param pathname - public pathname as received (`/fr/components/jarvis-dock`)
 * @returns The same locale prefix on the new slug, or `undefined` when the path is not the page of a renamed component
 * @example
 * renamedComponentPathname("/fr/components/jarvis-dock"); // "/fr/components/command-dock"
 */
export function renamedComponentPathname(pathname: string): string | undefined {
  const path = splitLocale(pathname);
  const slug = COMPONENT_PAGE.exec(path.pathname)?.[1];
  const target = slug === undefined ? undefined : RENAMED_COMPONENTS.get(slug);
  if (target === undefined) return undefined;
  const prefix = path.prefixed ? `/${path.locale}` : "";

  return `${prefix}/components/${target}`;
}

/**
 * Permanent redirect from the page of a renamed component to its new page,
 * keeping the locale prefix and the query. The lookup is an exact, case-sensitive
 * match on the slug: a `redirects()` entry in `next.config.mjs` matches
 * case-insensitively, which is why the site redirects in the middleware.
 *
 * @param request - the incoming request
 * @returns A 308 response, or `undefined` when the request is not for a renamed component
 * @example
 * renamedComponentRedirect(request)?.headers.get("location"); // ".../components/command-dock"
 */
export function renamedComponentRedirect(
  request: NextRequest,
): NextResponse | undefined {
  const pathname = renamedComponentPathname(request.nextUrl.pathname);
  if (!pathname) return undefined;

  const target = request.nextUrl.clone();
  target.pathname = pathname;

  return NextResponse.redirect(target, 308);
}
