import { notFound } from "next/navigation";

import ComponentPage from "@/app/[locale]/components/[slug]/page";
import { isPlatformVariant } from "@/lib/platform-variant";

type Props = Parameters<typeof ComponentPage>[0];

export { generateMetadata } from "@/app/[locale]/components/[slug]/page";

export const revalidate = 86_400;

/**
 * The first request for a variant copy renders and caches it. Building 2
 * platforms x 2 locales x every component up front would multiply the build
 * time for pages with low traffic.
 */
export function generateStaticParams(): Record<string, string>[] {
  return [];
}

export default async function PlatformComponentPage(props: Props) {
  const { platform } = await props.params;
  if (!isPlatformVariant(platform)) notFound();

  return <ComponentPage {...props} />;
}
