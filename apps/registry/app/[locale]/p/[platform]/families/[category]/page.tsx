import { generateStaticParams as familyStaticParameters } from "@/app/[locale]/families/[category]/page";

export {
  default,
  generateMetadata,
} from "@/app/[locale]/families/[category]/page";

export const dynamicParams = false;
export const revalidate = 86_400;

/**
 * Families have `native` as their one variant. The clean URL already shows
 * `web`, so `?platform=web` needs no copy: the middleware serves the clean
 * page and redirects a direct hit on `/p/web/...` to the public URL.
 */
export function generateStaticParams() {
  return familyStaticParameters().map((parameters) => ({
    ...parameters,
    platform: "native",
  }));
}
