import type { Locale } from "@/i18n/locales";

/**
 * The `locale` prop for a language link. next-intl prefixes any href given an
 * explicit `locale`, even the current one, so on an English page the "EN" link
 * would point at `/en/...`, a redirect to the page the visitor is on. The
 * current language links to the page itself, so it gets no `locale`.
 *
 * @param entry - language the link switches to
 * @param current - language of the current page
 * @returns `entry` when it differs from the current language, else `undefined`
 */
export function languageSwitchLocale(
  entry: Locale,
  current: Locale,
): Locale | undefined {
  return entry === current ? undefined : entry;
}
