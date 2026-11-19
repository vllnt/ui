import { notFound } from "next/navigation";

import ComponentPage from "@/app/[locale]/components/[slug]/page";
import { isPlatformVariant } from "@/lib/platform-variant";

type Props = Parameters<typeof ComponentPage>[0];

export { generateMetadata } from "@/app/[locale]/components/[slug]/page";

export const revalidate = 86_400;

/**
 * The first request for a variant copy renders and caches it. Building 2
 * platforms x 2 locales x every component up front doubled the page count,
 * the build time and the `.next` size for pages with low traffic.
 *
 * This route keeps `dynamicParams` on, so it would cache a made-up slug's 404.
 * The middleware rewrites a registry slug here and no other slug; a made-up
 * slug stays on the clean route, which has `dynamicParams = false` and answers
 * without a cache entry.
 */
export function generateStaticParams(): Record<string, string>[] {
  return [];
}

export default async function PlatformComponentPage(props: Props) {
  const { platform } = await props.params;
  if (!isPlatformVariant(platform)) notFound();

  return <ComponentPage {...props} />;
}
