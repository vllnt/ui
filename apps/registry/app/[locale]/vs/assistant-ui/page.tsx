import type { Metadata } from "next";

import {
  vsComparisonMetadata,
  VsComparisonPage,
} from "@/components/vs-comparison";
import type { Locale } from "@/i18n/routing";

type Props = {
  readonly params: Promise<{ locale: Locale }>;
};

const CONFIG = {
  cta: { href: "/families/ai", labelKey: "exploreAi" },
  namespace: "pages.vs.assistantUi",
  otherName: "assistant-ui",
  pathname: "/vs/assistant-ui",
  rowKeys: [
    "scope",
    "installModel",
    "beyondChat",
    "agentRegistry",
    "theming",
    "whenToPick",
  ],
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return vsComparisonMetadata(CONFIG, locale);
}

export default async function VsAssistantUiPage({ params }: Props) {
  const { locale } = await params;
  return <VsComparisonPage config={CONFIG} locale={locale} />;
}
