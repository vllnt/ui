import { notFound } from "next/navigation";

import ComponentPage, {
  generateStaticParams as componentStaticParameters,
} from "@/app/[locale]/components/[slug]/page";
import { isPlatformVariant, PLATFORM_VARIANTS } from "@/lib/platform-variant";

type Props = Parameters<typeof ComponentPage>[0];

export { generateMetadata } from "@/app/[locale]/components/[slug]/page";

export const dynamicParams = false;
export const revalidate = 86_400;

/**
 * Both platforms for every component and locale. The clean URL shows the full
 * catalog, so `web` and `native` each differ from it and each needs a copy.
 * Docs and families need one copy, `native`: their clean URL already shows `web`.
 */
export async function generateStaticParams() {
  const parameters = await componentStaticParameters();

  return PLATFORM_VARIANTS.flatMap((platform) =>
    parameters.map((entry) => ({ ...entry, platform })),
  );
}

export default async function PlatformComponentPage(props: Props) {
  const { platform } = await props.params;
  if (!isPlatformVariant(platform)) notFound();

  return <ComponentPage {...props} />;
}
