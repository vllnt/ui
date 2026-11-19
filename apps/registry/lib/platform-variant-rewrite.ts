import { defaultLocale } from "@/i18n/locales";
import { getPlatform } from "@/lib/platform";
import { splitLocale } from "@/lib/platform-variant";
import type { ComponentPlatform } from "@/lib/registry";

import componentSlugs from "./component-slugs.json";

/**
 * Route families whose HTML depends on the platform, and what the clean URL means for each.
 * `slugs` lists the slugs a route has a page for. The component variant renders on demand,
 * so it would cache a 404 for an unknown slug; such a slug stays on the clean route,
 * which has `dynamicParams = false` and answers an uncached 404.
 *
 * This module holds the slug list and the middleware is its one importer; a
 * client component that imported it would ship the whole list to the browser.
 */
const VARIANT_ROUTES: readonly {
  readonly fallback: "all" | ComponentPlatform;
  readonly pattern: RegExp;
  readonly slugs?: ReadonlySet<string>;
}[] = [
  {
    fallback: "all",
    pattern: /^\/components(?:\/([^/]+))?$/,
    slugs: new Set(componentSlugs),
  },
  { fallback: "web", pattern: /^\/docs\/installation$/ },
  { fallback: "web", pattern: /^\/families(?:\/[^/]+)?$/ },
];

type VariantRoute = (typeof VARIANT_ROUTES)[number];

function findVariantRoute(pathname: string): undefined | VariantRoute {
  return VARIANT_ROUTES.find((route) => {
    const match = route.pattern.exec(pathname);
    if (!match) return false;
    const slug = match[1];

    return slug === undefined || route.slugs?.has(slug) !== false;
  });
}

/**
 * Internal route that holds the prerendered copy of a public URL for one
 * platform, or `undefined` when the clean page already is that copy.
 *
 * @param pathname - public pathname as received (`/fr/components/button`)
 * @param platform - raw `platform` query value, if the URL has one
 * @returns Internal pathname such as `/fr/p/native/components/button`
 * @example
 * variantPathname("/components/button", "native"); // "/en/p/native/components/button"
 */
export function variantPathname(
  pathname: string,
  platform: string | undefined,
): string | undefined {
  const variant = getPlatform(platform, "all");
  const path = splitLocale(pathname);
  const route = findVariantRoute(path.pathname);
  const defaultPrefix = path.prefixed && path.locale === defaultLocale;
  if (!variant || !route || route.fallback === variant || defaultPrefix) {
    return undefined;
  }

  return `/${path.locale}/p/${variant}${path.pathname}`;
}
