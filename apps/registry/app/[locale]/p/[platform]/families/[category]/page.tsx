import { generateStaticParams as familyStaticParameters } from "@/app/[locale]/families/[category]/page";

export {
  default,
  generateMetadata,
} from "@/app/[locale]/families/[category]/page";

export const dynamicParams = false;
export const revalidate = 86_400;

export function generateStaticParams() {
  return familyStaticParameters().map((parameters) => ({
    ...parameters,
    platform: "native",
  }));
}
