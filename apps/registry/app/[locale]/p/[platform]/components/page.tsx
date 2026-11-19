import { routing } from "@/i18n/routing";
import { PLATFORM_VARIANTS } from "@/lib/platform-variant";

export { default, generateMetadata } from "@/app/[locale]/components/page";

export const dynamicParams = false;
export const revalidate = 86_400;

export function generateStaticParams() {
  return routing.locales.flatMap((locale) =>
    PLATFORM_VARIANTS.map((platform) => ({ locale, platform })),
  );
}
