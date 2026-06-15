import { type Locale, routing } from "@/i18n/routing";

/** Canonical absolute origin for the registry site. Single source of truth. */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://ui.vllnt.ai";

export function localizePathname(
  pathname: string,
  locale: Locale = routing.defaultLocale,
): string {
  const trimmed = pathname.startsWith("/") ? pathname : `/${pathname}`;
  const normalized = trimmed === "/" ? "" : trimmed.replace(/\/$/, "");

  if (locale === routing.defaultLocale) {
    return normalized || "/";
  }

  return `/${locale}${normalized}`;
}

export function canonical(
  pathname: string,
  locale: Locale = routing.defaultLocale,
): string {
  const localized = localizePathname(pathname, locale);
  return localized === "/" ? SITE_URL : `${SITE_URL}${localized}`;
}

export function languageAlternates(pathname: string): Record<string, string> {
  const alternates = Object.fromEntries(
    routing.locales.map((locale) => [locale, canonical(pathname, locale)]),
  );

  return {
    ...alternates,
    "x-default": canonical(pathname, routing.defaultLocale),
  };
}

export function ogLocale(locale: Locale): string {
  return locale === "fr" ? "fr_FR" : "en_US";
}

export function alternateOgLocales(locale: Locale): string[] {
  return routing.locales
    .filter((entry) => entry !== locale)
    .map((entry) => ogLocale(entry));
}
