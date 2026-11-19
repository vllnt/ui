import { defaultLocale, type Locale, locales } from "@/i18n/locales";
import { getPlatform } from "@/lib/platform";
import type { ComponentPlatform } from "@/lib/registry";

/**
 * Catalog pages render at build time, so their HTML cannot read `?platform=`.
 * Each platform instead gets its own prerendered copy under a private
 * `/<locale>/p/<platform>/...` route, and the middleware rewrites the public
 * URL (`/components/button?platform=native`) to it. The copy is never a public URL.
 */
export const PLATFORM_VARIANTS = [
  "native",
  "web",
] as const satisfies readonly ComponentPlatform[];

const VARIANT_NAMES: readonly string[] = PLATFORM_VARIANTS;

/**
 * Whether a route parameter names a platform that has a variant copy.
 *
 * @param value - raw `platform` route parameter
 * @returns `true` for `native` and `web`
 */
export function isPlatformVariant(
  value: string | undefined,
): value is (typeof PLATFORM_VARIANTS)[number] {
  return value !== undefined && VARIANT_NAMES.includes(value);
}

const PRIVATE_PATTERN = new RegExp(
  `^/p/(${PLATFORM_VARIANTS.join("|")})(/.*)$`,
);

type SplitPath = {
  readonly locale: Locale;
  readonly pathname: string;
  readonly prefixed: boolean;
};

/**
 * Splits the locale prefix off a public pathname.
 *
 * @param pathname - public pathname as received (`/fr/components/button`)
 * @returns The locale (default when unprefixed) and the pathname without it
 * @example
 * splitLocale("/fr/docs/cli"); // { locale: "fr", pathname: "/docs/cli", prefixed: true }
 */
export function splitLocale(pathname: string): SplitPath {
  const locale = locales.find(
    (entry) => pathname === `/${entry}` || pathname.startsWith(`/${entry}/`),
  );
  if (!locale) return { locale: defaultLocale, pathname, prefixed: false };

  return {
    locale,
    pathname: pathname.slice(locale.length + 1) || "/",
    prefixed: true,
  };
}

/**
 * Public URL of a private variant route, for redirecting direct hits so the
 * copy never becomes a second indexable URL.
 *
 * @param pathname - pathname as received (`/fr/p/native/components/button`)
 * @returns Public pathname and platform, or `undefined` for any other path
 * @example
 * publicVariant("/p/native/components/button");
 * // { pathname: "/components/button", platform: "native" }
 */
export function publicVariant(
  pathname: string,
): undefined | { pathname: string; platform: ComponentPlatform } {
  const path = splitLocale(pathname);
  const [, platform, rest] = PRIVATE_PATTERN.exec(path.pathname) ?? [];
  const variant = getPlatform(platform, "all");
  if (!variant || !rest) return undefined;
  const prefix =
    path.prefixed && path.locale !== defaultLocale ? `/${path.locale}` : "";

  return { pathname: `${prefix}${rest}`, platform: variant };
}

/**
 * The pathname a visitor sees for the current page. A platform variant renders
 * under its private route, so shell links built from the route would point at
 * a private URL.
 *
 * @param pathname - pathname of the current route, with or without a locale
 * @returns The public pathname, or `pathname` unchanged for a public route
 * @example
 * publicPagePathname("/p/native/components/button"); // "/components/button"
 * publicPagePathname("/components/button"); // "/components/button"
 */
export function publicPagePathname(pathname: string): string {
  return publicVariant(pathname)?.pathname ?? pathname;
}
