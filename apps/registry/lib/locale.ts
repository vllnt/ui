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
 * const { locale, slug } = await resolveLocaleParameters(params);
 */
export async function resolveLocaleParameters<T extends { locale: Locale }>(
  parameters: Promise<T>,
): Promise<T> {
  const resolved = await parameters;
  setRequestLocale(resolved.locale);
  return resolved;
}
