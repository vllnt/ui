import { generateStaticParams as docsStaticParameters } from "@/app/[locale]/docs/[slug]/page";

export { default, generateMetadata } from "@/app/[locale]/docs/[slug]/page";

export const dynamicParams = false;
export const revalidate = 86_400;

export function generateStaticParams() {
  return docsStaticParameters()
    .filter((parameters) => parameters.slug === "installation")
    .map((parameters) => ({ ...parameters, platform: "native" }));
}
