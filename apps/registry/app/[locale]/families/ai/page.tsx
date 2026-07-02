import { Sidebar } from "@vllnt/ui";
import { ArrowRight, Sparkles, Terminal } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { setRequestLocale } from "next-intl/server";

import { ComponentCard } from "@/components/component-card";
import { Footer } from "@/components/footer/footer";
import type { Locale } from "@/i18n/routing";
import {
  AI_COMPONENT_GROUPS,
  getAiComponentSlugs,
  resolveAiComponent,
} from "@/lib/ai-seo";
import {
  breadcrumbLd,
  collectionPageLd,
  faqPageLd,
  jsonLdScriptAttributes,
} from "@/lib/jsonld";
import { generateOGMetadata, generateTwitterMetadata } from "@/lib/og";
import { canonical, languageAlternates, localizePathname } from "@/lib/seo";
import { getSidebarSections } from "@/lib/sidebar-sections";

type Props = {
  readonly params: Promise<{ locale: Locale }>;
};

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://ui.vllnt.ai";
const PATHNAME = "/families/ai";

const TITLE = "AI Agent UI Components — chat, streaming, tools, citations";
const DESCRIPTION =
  "The open-source UI design system for AI agents and AI-first apps. React components for AI chat, streaming text, tool calls, citations, agent activity, and artifacts. Install via the shadcn CLI.";

const FAQ = [
  {
    answer:
      "An agent-first design system gives you the UI primitives that AI products actually need — chat input, message bubbles, streaming text, tool-call displays, source citations, agent activity timelines, and artifacts — and also ships every component as machine-readable JSON so AI coding agents can install it without scraping HTML. VLLNT UI is open source (MIT) and installs with the shadcn CLI.",
    question: "What is an agent-first UI design system?",
  },
  {
    answer:
      "At minimum: AI Chat Input for the composer, AI Message Bubble to render each turn, and AI Streaming Text for token-by-token output. Add AI Tool Call Display and Agent Activity for agentic flows, AI Source Citation for RAG, and AI Artifact for canvas-style output.",
    question: "Which components do I need to build an AI chat app in React?",
  },
  {
    answer:
      "Three surfaces: /llms.txt (a concise index per the llmstxt.org spec), /llms-full.txt (the full registry context in one fetch), and /r/<name>.json (a machine-readable descriptor per component with props, accessibility schema, and examples). Coding agents like Claude, Cursor, Cline, and Continue read these directly.",
    question: "How do AI agents consume VLLNT UI?",
  },
  {
    answer:
      "Yes. VLLNT UI is open source under the MIT license. You own the source after install, with no backend and no tracking.",
    question: "Is VLLNT UI free to use?",
  },
];

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const ogParameters = {
    description: DESCRIPTION,
    title: TITLE,
    type: "page" as const,
  };

  return {
    alternates: {
      canonical: canonical(PATHNAME, locale),
      languages: languageAlternates(PATHNAME),
    },
    description: DESCRIPTION,
    openGraph: generateOGMetadata(ogParameters, {
      locale,
      pathname: PATHNAME,
    }),
    title: `${TITLE} | VLLNT UI`,
    twitter: generateTwitterMetadata(ogParameters),
  };
}

export default async function AiHubPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const aiComponents = getAiComponentSlugs().flatMap((slug) => {
    const resolved = resolveAiComponent(slug);
    return resolved ? [resolved] : [];
  });
  const componentCount = aiComponents.length;

  return (
    <>
      <script
        {...jsonLdScriptAttributes([
          breadcrumbLd([
            { name: "Home", url: SITE_URL },
            { name: "Components", url: `${SITE_URL}/components` },
            { name: "AI", url: `${SITE_URL}${PATHNAME}` },
          ]),
          collectionPageLd({
            description: DESCRIPTION,
            items: aiComponents.map((component) => ({
              name: component.title,
              url: `${SITE_URL}/components/${component.name}`,
            })),
            title: TITLE,
            url: `${SITE_URL}${PATHNAME}`,
          }),
          faqPageLd(FAQ),
        ])}
      />
      <Sidebar sections={getSidebarSections(undefined, locale)} />
      <main className="flex-1 overflow-y-auto bg-background">
        {/* Hero / manifesto */}
        <section className="border-b border-border">
          <div className="mx-auto max-w-7xl px-4 py-20 lg:px-8">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Sparkles className="size-4" />
              UI for AI agents
            </div>
            <h1 className="mt-3 text-4xl font-semibold leading-tight md:text-5xl">
              The UI design system for AI agents and AI-first apps.
            </h1>
            <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
              Every AI product needs the same surfaces — a chat composer,
              message bubbles, streaming output, tool calls, citations, agent
              activity, and artifacts. VLLNT UI ships {componentCount} of them
              as accessible React components you own after install, each also
              readable by AI coding agents as JSON.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                className="inline-flex h-11 items-center gap-2 rounded-md bg-foreground px-5 text-sm font-medium text-background hover:opacity-90"
                href={localizePathname("/build/ai-chat-ui", locale)}
              >
                Build an AI chat UI
                <ArrowRight className="size-4" />
              </Link>
              <Link
                className="inline-flex h-11 items-center gap-2 rounded-md border border-border px-5 text-sm font-medium hover:bg-muted"
                href={localizePathname("/docs/agents", locale)}
              >
                How agents consume the registry
              </Link>
            </div>
          </div>
        </section>

        {/* Component family grouped by job-to-be-done */}
        <section className="border-b border-border">
          <div className="mx-auto max-w-7xl px-4 py-16 lg:px-8">
            <h2 className="text-2xl font-semibold">The AI component family</h2>
            <p className="mt-2 max-w-2xl text-muted-foreground">
              Grouped by the job they do in an AI product. Mix and match — every
              component installs independently with the shadcn CLI.
            </p>

            <div className="mt-10 space-y-12">
              {AI_COMPONENT_GROUPS.map((group) => (
                <div key={group.heading}>
                  <h3 className="text-lg font-semibold">{group.heading}</h3>
                  <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
                    {group.blurb}
                  </p>
                  <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {group.slugs.map((slug) => {
                      const resolved = resolveAiComponent(slug);
                      if (!resolved) {
                        return null;
                      }
                      return (
                        <ComponentCard
                          description={resolved.description}
                          key={slug}
                          locale={locale}
                          slug={resolved.name}
                          title={resolved.title}
                        />
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Agent surface */}
        <section className="border-b border-border bg-muted/30">
          <div className="mx-auto max-w-7xl px-4 py-16 lg:px-8">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Terminal className="size-4" />
              Readable by agents
            </div>
            <h2 className="mt-2 text-2xl font-semibold">
              Your AI agent can install these too.
            </h2>
            <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
              The registry is exposed as structured data, so coding agents pick
              the right component without scraping HTML.
            </p>
            <div className="mt-8 grid gap-4 md:grid-cols-3">
              <a
                className="group rounded-lg border border-border p-5 hover:border-foreground/40"
                href="/llms.txt"
                rel="noreferrer"
                target="_blank"
              >
                <p className="font-mono text-sm">/llms.txt</p>
                <p className="mt-3 text-sm text-muted-foreground">
                  Concise index per the llmstxt.org spec — sections, links,
                  descriptions.
                </p>
              </a>
              <a
                className="group rounded-lg border border-border p-5 hover:border-foreground/40"
                href="/llms-full.txt"
                rel="noreferrer"
                target="_blank"
              >
                <p className="font-mono text-sm">/llms-full.txt</p>
                <p className="mt-3 text-sm text-muted-foreground">
                  Full registry context in one fetch — docs plus every component
                  descriptor.
                </p>
              </a>
              <Link
                className="group rounded-lg border border-border p-5 hover:border-foreground/40"
                href={localizePathname("/docs/agents", locale)}
              >
                <p className="font-mono text-sm">/r/&lt;name&gt;.json</p>
                <p className="mt-3 text-sm text-muted-foreground">
                  Per-component descriptor: props, accessibility schema, and
                  usage examples.
                </p>
              </Link>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section>
          <div className="mx-auto max-w-7xl px-4 py-16 lg:px-8">
            <h2 className="text-2xl font-semibold">Frequently asked</h2>
            <dl className="mt-8 space-y-8">
              {FAQ.map((item) => (
                <div className="max-w-3xl" key={item.question}>
                  <dt className="font-medium">{item.question}</dt>
                  <dd className="mt-2 text-muted-foreground">{item.answer}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        <Footer />
      </main>
    </>
  );
}
