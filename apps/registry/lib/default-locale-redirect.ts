import { defaultLocale } from "@/i18n/locales";
import { splitLocale } from "@/lib/platform-variant";

/**
 * The default locale has no prefix (`/docs/cli`), so `/en/docs/cli` is a second
 * spelling of the same page. The middleware answers it with a permanent
 * redirect to the unprefixed URL, so crawlers and links settle on one.
 *
 * @param pathname - pathname as received (`/en/docs/cli`)
 * @returns The unprefixed pathname, or `undefined` for any other path
 * @example
 * defaultLocalePrefixTarget("/en/docs/cli"); // "/docs/cli"
 * defaultLocalePrefixTarget("/en"); // "/"
 * defaultLocalePrefixTarget("/fr/docs/cli"); // undefined
 */
export function defaultLocalePrefixTarget(
  pathname: string,
): string | undefined {
  const path = splitLocale(pathname);

  return path.prefixed && path.locale === defaultLocale
    ? path.pathname
    : undefined;
}
