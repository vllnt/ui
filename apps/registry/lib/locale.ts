import { setRequestLocale } from "next-intl/server";

import type { Locale } from "@/i18n/routing";

/** Standard props shape for every `[locale]` page. */
export type LocalePageProps = {
  readonly params: Promise<{ locale: Locale }>;
};

/**
 * Awaits a `[locale]` route's params and activates the locale for static
 * rendering (`setRequestLocale`) in one step — the boilerplate every page
 * under `app/[locale]` otherwise repeats.
 *
 * @param params - The page's `params` promise (may carry extra segments)
 * @returns The resolved params object
 * @example
 * const { locale, slug } = await resolveLocaleParams(params);
 */
export async function resolveLocaleParams<T extends { locale: Locale }>(
  params: Promise<T>,
): Promise<T> {
  const resolved = await params;
  setRequestLocale(resolved.locale);
  return resolved;
}
