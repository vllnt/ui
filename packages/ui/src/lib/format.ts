const NUMBER_FORMATTER_CACHE = new Map<string, Intl.NumberFormat>();
const DATE_TIME_FORMATTER_CACHE = new Map<string, Intl.DateTimeFormat>();

function buildCacheKey(
  locale: string | undefined,
  options: object | undefined,
): string {
  return `${locale ?? ""}|${options ? JSON.stringify(options) : ""}`;
}

/**
 * Returns a cached `Intl.NumberFormat` for the locale/options pair.
 *
 * Formatter construction is expensive; the cache makes repeated calls from
 * render paths free.
 *
 * @param locale - BCP 47 locale, or undefined for the runtime default
 * @param options - Standard `Intl.NumberFormat` options
 * @returns A shared formatter instance
 */
export function getNumberFormatter(
  locale?: string,
  options?: Intl.NumberFormatOptions,
): Intl.NumberFormat {
  const key = buildCacheKey(locale, options);
  let formatter = NUMBER_FORMATTER_CACHE.get(key);
  if (!formatter) {
    formatter = Intl.NumberFormat(locale, options);
    NUMBER_FORMATTER_CACHE.set(key, formatter);
  }
  return formatter;
}

/**
 * Returns a cached currency-style `Intl.NumberFormat`.
 *
 * @param locale - BCP 47 locale
 * @param currency - ISO 4217 currency code (e.g. "USD")
 * @returns A shared currency formatter instance
 */
export function getCurrencyFormatter(
  locale: string,
  currency: string,
): Intl.NumberFormat {
  return getNumberFormatter(locale, { currency, style: "currency" });
}

/**
 * Returns a cached `Intl.DateTimeFormat` for the locale/options pair.
 *
 * @param locale - BCP 47 locale, or undefined for the runtime default
 * @param options - Standard `Intl.DateTimeFormat` options
 * @returns A shared formatter instance
 */
export function getDateTimeFormatter(
  locale?: string,
  options?: Intl.DateTimeFormatOptions,
): Intl.DateTimeFormat {
  const key = buildCacheKey(locale, options);
  let formatter = DATE_TIME_FORMATTER_CACHE.get(key);
  if (!formatter) {
    formatter = Intl.DateTimeFormat(locale, options);
    DATE_TIME_FORMATTER_CACHE.set(key, formatter);
  }
  return formatter;
}

/**
 * Formats a percentage change with an explicit sign for gains: `+1.25%`,
 * `-0.40%`, `0.00%`.
 *
 * @param change - The percentage change as a number (1.25 means 1.25%)
 * @returns The signed, two-decimal percentage string
 */
export function formatChange(change: number): string {
  const sign = change > 0 ? "+" : "";
  return `${sign}${change.toFixed(2)}%`;
}
