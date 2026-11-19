import { generateStaticParams as docsStaticParameters } from "@/app/[locale]/docs/[slug]/page";

export { default, generateMetadata } from "@/app/[locale]/docs/[slug]/page";

export const dynamicParams = false;
export const revalidate = 86_400;

/**
 * The installation page has `native` as its one variant. The clean URL already
 * shows `web`, so `?platform=web` needs no copy: the middleware serves the
 * clean page and redirects a direct hit on `/p/web/...` to the public URL.
 */
export function generateStaticParams() {
  return docsStaticParameters()
    .filter((parameters) => parameters.slug === "installation")
    .map((parameters) => ({ ...parameters, platform: "native" }));
}
