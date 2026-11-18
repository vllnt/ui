import { routing } from "@/i18n/routing";

export { default, generateMetadata } from "@/app/[locale]/families/page";

export const dynamicParams = false;
export const revalidate = 86_400;

/** `native` is the one variant; the clean URL already shows `web`. */
export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale, platform: "native" }));
}
