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

const PATHNAME = "/vs/assistant-ui";
const TITLE = "VLLNT UI vs assistant-ui";

const ROWS: readonly ComparisonRow[] = [
  {
    attribute: "Scope",
    other: "Focused on the chat/assistant thread experience",
    vllnt:
      "Full design system — chat plus agents, artifacts, and 200+ UI components",
  },
  {
    attribute: "Install model",
    other: "npm dependency with a runtime",
    vllnt: "shadcn CLI — source copied into your repo, yours to edit",
  },
  {
    attribute: "Beyond chat",
    other: "Primarily conversation-centric",
    vllnt:
      "Tool calls, agent activity, citations, model comparison, artifacts, dashboards",
  },
  {
    attribute: "Agent-readable registry",
    other: "No",
    vllnt: "Yes — llms.txt, llms-full.txt, per-component JSON, MCP",
  },
  {
    attribute: "Theming",
    other: "Themeable chat primitives",
    vllnt: "CSS variables + design tokens shared across the whole product",
  },
  {
    attribute: "When to pick it",
    other: "You want an opinionated chat thread fast",
    vllnt: "You're building a whole AI-first product, not just a chat box",
  },
];

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;

  return comparisonPageMetadata({
    description:
      "VLLNT UI vs assistant-ui: a full AI-first design system you own via the shadcn CLI vs a focused chat-thread library. Honest comparison of scope, install, and theming.",
    locale,
    pathname: PATHNAME,
    title: `${TITLE} | VLLNT UI`,
  });
}

export default async function VsAssistantUiPage({ params }: Props) {
  const { locale } = await resolveLocaleParameters(params);

  return (
    <ComparisonPage
      competitorLabel="assistant-ui"
      cta={{
        href: localizePathname("/ai", locale),
        label: "Explore all AI agent components",
      }}
      intro={
        <p className="mt-6 text-lg text-muted-foreground">
          assistant-ui gives you an opinionated chat thread fast. VLLNT UI is a
          broader, agent-first design system: the same chat surfaces, plus the
          tool calls, agent activity, citations, artifacts, and product UI an
          AI-first app needs — all installed via the shadcn CLI so you own the
          source.
        </p>
      }
      locale={locale}
      pathname={PATHNAME}
      rows={ROWS}
      title={TITLE}
    />
  );
}
