import { permanentRedirect } from "next/navigation";

import type { Locale } from "@/i18n/routing";
import { type PlatformQuery, withPlatformQuery } from "@/lib/platform";
import { localizePathname } from "@/lib/seo";

type Props = {
  readonly params: Promise<{ locale: Locale }>;
  readonly searchParams: Promise<PlatformQuery>;
};

/** Preserve old bookmarks while keeping one canonical native catalog route. */
export default async function NativeCatalogRedirect({
  params,
  searchParams,
}: Props) {
  const [{ locale }, query] = await Promise.all([params, searchParams]);

  permanentRedirect(
    withPlatformQuery(localizePathname("/components", locale), query, "native"),
  );
}
