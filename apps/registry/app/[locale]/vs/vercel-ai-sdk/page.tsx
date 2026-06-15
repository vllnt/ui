import type { Metadata } from "next";

import {
  ComparisonPage,
  comparisonPageMetadata,
  type ComparisonRow,
} from "@/components/comparison-page/comparison-page";
import type { Locale } from "@/i18n/routing";
import { resolveLocaleParameters } from "@/lib/locale";
import { localizePathname } from "@/lib/seo";

type Props = {
  readonly params: Promise<{ locale: Locale }>;
};

const PATHNAME = "/vs/vercel-ai-sdk";
const TITLE = "VLLNT UI vs Vercel AI SDK";

const ROWS: readonly ComparisonRow[] = [
  {
    attribute: "What it is",
    other: "A runtime/data layer — streaming, useChat, model providers",
    vllnt: "A UI design system — presentational React components you own",
  },
  {
    attribute: "Primary job",
    other: "How the AI app talks to models and streams responses",
    vllnt:
      "How the AI app looks and behaves (chat, tools, citations, artifacts)",
  },
  {
    attribute: "Component breadth",
    other: "Focused on chat/conversation primitives",
    vllnt: "Full design system — chat plus the rest of the product UI",
  },
  {
    attribute: "You own the source",
    other: "Consumed as an npm dependency",
    vllnt: "Yes — installed via shadcn CLI into your repo",
  },
  {
    attribute: "Agent-readable registry",
    other: "No",
    vllnt: "Yes — llms.txt, llms-full.txt, per-component JSON",
  },
  {
    attribute: "Best together?",
    other: "Use the AI SDK for the data layer — they compose cleanly",
    vllnt: "Use VLLNT UI for the interface",
  },
];

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;

  return comparisonPageMetadata({
    description:
      "VLLNT UI vs the Vercel AI SDK: a UI design system you own vs a model/streaming runtime. They solve different problems and compose together. Honest comparison.",
    locale,
    pathname: PATHNAME,
    title: `${TITLE} | VLLNT UI`,
  });
}

export default async function VsVercelAiSdkPage({ params }: Props) {
  const { locale } = await resolveLocaleParameters(params);

  return (
    <ComparisonPage
      competitorLabel="Vercel AI SDK"
      cta={{
        href: localizePathname("/build/ai-chat-ui", locale),
        label: "Build an AI chat UI with VLLNT UI",
      }}
      intro={
        <p className="mt-6 text-lg text-muted-foreground">
          These aren&apos;t competitors — they&apos;re layers. The Vercel AI SDK
          is the data layer that streams tokens and talks to model providers.
          VLLNT UI is the design system that renders the result: chat input,
          message bubbles, streaming text, tool calls, citations, and artifacts.
          Most AI apps want both.
        </p>
      }
      locale={locale}
      pathname={PATHNAME}
      rows={ROWS}
      title={TITLE}
    />
  );
}
