import { createNavigation } from "next-intl/navigation";
import { defineRouting } from "next-intl/routing";

import { defaultLocale, type Locale, locales } from "./locales";

export const routing = defineRouting({
  defaultLocale,
  localePrefix: "as-needed",
  locales,
});

/* eslint-disable-next-line @typescript-eslint/naming-convention */
export const { getPathname, Link, redirect, usePathname, useRouter } =
  createNavigation(routing);

export function isLocale(value: string): value is Locale {
  return (routing.locales as readonly string[]).includes(value);
}

export { type Locale } from "./locales";
