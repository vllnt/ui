import { defaultLocale, type Locale, locales } from "@/i18n/locales";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://ui.vllnt.com";

export function localizePathname(
  pathname: string,
  locale: Locale = defaultLocale,
): string {
  const trimmed = pathname.startsWith("/") ? pathname : `/${pathname}`;
  const normalized = trimmed === "/" ? "" : trimmed.replace(/\/$/, "");

  if (locale === defaultLocale) {
    return normalized || "/";
  }

  return `/${locale}${normalized}`;
}

export function canonical(
  pathname: string,
  locale: Locale = defaultLocale,
): string {
  const localized = localizePathname(pathname, locale);
  return localized === "/" ? SITE_URL : `${SITE_URL}${localized}`;
}

/**
 * Absolute URL of a site path or of a URL that is already absolute.
 *
 * @param value - site path (`/api/og?title=x`) or absolute URL
 * @returns The absolute URL
 */
export function absoluteUrl(value: string): string {
  return new URL(value, SITE_URL).toString();
}

/**
 * The hreflang map of a page. `available` lists the locales the page exists in;
 * a page that has no translation must not advertise one that answers 404.
 * `x-default` points at the default locale, or at the first available locale
 * when the page has no default-locale version.
 *
 * @param pathname - locale-relative path of the page
 * @param available - locales that serve the page; every locale by default
 * @returns hreflang value to absolute URL
 */
export function languageAlternates(
  pathname: string,
  available: readonly Locale[] = locales,
): Record<string, string> {
  const alternates = Object.fromEntries(
    available.map((locale) => [locale, canonical(pathname, locale)]),
  );
  const fallback = available.includes(defaultLocale)
    ? defaultLocale
    : available[0];

  return {
    ...alternates,
    ...(fallback ? { "x-default": canonical(pathname, fallback) } : {}),
  };
}

export function ogLocale(locale: Locale): string {
  return locale === "fr" ? "fr_FR" : "en_US";
}

export function alternateOgLocales(locale: Locale): string[] {
  return locales
    .filter((entry) => entry !== locale)
    .map((entry) => ogLocale(entry));
}
