import { permanentRedirect } from "next/navigation";

import type { Locale } from "@/i18n/routing";
import { localizePathname } from "@/lib/seo";

type Props = {
  readonly params: Promise<{ locale: Locale }>;
};

export default async function DocumentationChangelogRedirect({
  params,
}: Props) {
  const { locale } = await params;
  permanentRedirect(localizePathname("/changelog", locale));
}
