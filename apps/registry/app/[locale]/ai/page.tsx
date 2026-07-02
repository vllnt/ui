import { permanentRedirect } from "next/navigation";
import { setRequestLocale } from "next-intl/server";

import { type Locale, routing } from "@/i18n/routing";
import { localizePathname } from "@/lib/seo";

type Props = {
  readonly params: Promise<{ locale: Locale }>;
};

export function generateStaticParams(): { locale: Locale }[] {
  return routing.locales.map((locale) => ({ locale }));
}

/**
 * The AI hub moved to `/families/ai` (all family landings now live under
 * `/families`). Permanently redirect the old `/ai` URL to preserve its SEO
 * equity and any external links.
 */
export default async function AiRedirect({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  permanentRedirect(localizePathname("/families/ai", locale));
}
