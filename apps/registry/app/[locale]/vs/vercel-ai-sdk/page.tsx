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
  cta: { href: "/build/ai-chat-ui", labelKey: "buildCta" },
  namespace: "pages.vs.vercelAiSdk",
  otherName: "Vercel AI SDK",
  pathname: "/vs/vercel-ai-sdk",
  rowKeys: [
    "whatItIs",
    "primaryJob",
    "componentBreadth",
    "ownSource",
    "agentRegistry",
    "bestTogether",
  ],
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return vsComparisonMetadata(CONFIG, locale);
}

export default async function VsVercelAiSdkPage({ params }: Props) {
  const { locale } = await params;
  return <VsComparisonPage config={CONFIG} locale={locale} />;
}
