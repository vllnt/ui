import { Sidebar } from "@vllnt/ui";
import type { Metadata } from "next";
import Link from "next/link";
import { setRequestLocale } from "next-intl/server";

import { Footer } from "@/components/footer/footer";
import type { Locale } from "@/i18n/routing";
import { breadcrumbLd, jsonLdScriptAttributes } from "@/lib/jsonld";
import { canonical, languageAlternates, localizePathname } from "@/lib/seo";
import { getSidebarSections } from "@/lib/sidebar-sections";

type Props = {
  readonly params: Promise<{ locale: Locale }>;
};

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://ui.vllnt.ai";
const PATHNAME = "/vs/vercel-ai-sdk";

type Row = {
  readonly attribute: string;
  readonly other: string;
  readonly vllnt: string;
};

const ROWS: readonly Row[] = [
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

  return {
    alternates: {
      canonical: canonical(PATHNAME, locale),
      languages: languageAlternates(PATHNAME),
    },
    description:
      "VLLNT UI vs the Vercel AI SDK: a UI design system you own vs a model/streaming runtime. They solve different problems and compose together. Honest comparison.",
    title: "VLLNT UI vs Vercel AI SDK | VLLNT UI",
  };
}

export default async function VsVercelAiSdkPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <script
        {...jsonLdScriptAttributes(
          breadcrumbLd([
            { name: "Home", url: SITE_URL },
            {
              name: "VLLNT UI vs Vercel AI SDK",
              url: `${SITE_URL}${PATHNAME}`,
            },
          ]),
        )}
      />
      <Sidebar sections={getSidebarSections(undefined, locale)} />
      <main className="flex-1 overflow-y-auto bg-background">
        <div className="mx-auto max-w-4xl px-4 py-16 lg:px-8">
          <h1 className="text-4xl font-semibold leading-tight md:text-5xl">
            VLLNT UI vs Vercel AI SDK
          </h1>
          <p className="mt-6 text-lg text-muted-foreground">
            These aren&apos;t competitors — they&apos;re layers. The Vercel AI
            SDK is the data layer that streams tokens and talks to model
            providers. VLLNT UI is the design system that renders the result:
            chat input, message bubbles, streaming text, tool calls, citations,
            and artifacts. Most AI apps want both.
          </p>

          <div className="mt-12 overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-border text-left">
                  <th className="py-3 pr-4 font-medium">Attribute</th>
                  <th className="py-3 pr-4 font-medium">VLLNT UI</th>
                  <th className="py-3 font-medium">Vercel AI SDK</th>
                </tr>
              </thead>
              <tbody>
                {ROWS.map((row) => (
                  <tr
                    className="border-b border-border align-top"
                    key={row.attribute}
                  >
                    <td className="py-3 pr-4 font-medium">{row.attribute}</td>
                    <td className="py-3 pr-4 text-muted-foreground">
                      {row.vllnt}
                    </td>
                    <td className="py-3 text-muted-foreground">{row.other}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-12 border-t border-border pt-8">
            <Link
              className="inline-flex items-center gap-1 font-medium text-foreground underline"
              href={localizePathname("/build/ai-chat-ui", locale)}
            >
              Build an AI chat UI with VLLNT UI
            </Link>
          </div>
        </div>
        <Footer />
      </main>
    </>
  );
}
