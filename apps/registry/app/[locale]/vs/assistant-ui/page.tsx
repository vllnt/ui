import { Sidebar } from "@vllnt/ui";
import type { Metadata } from "next";
import Link from "next/link";
import { setRequestLocale } from "next-intl/server";

import { Footer } from "@/components/footer/footer";
import type { Locale } from "@/i18n/routing";
import { breadcrumbLd, jsonLdScriptAttributes } from "@/lib/jsonld";
import { generateOGMetadata, generateTwitterMetadata } from "@/lib/og";
import { canonical, languageAlternates, localizePathname } from "@/lib/seo";
import { getSidebarSections } from "@/lib/sidebar-sections";

type Props = {
  readonly params: Promise<{ locale: Locale }>;
};

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://ui.vllnt.ai";
const PATHNAME = "/vs/assistant-ui";

type Row = {
  readonly attribute: string;
  readonly other: string;
  readonly vllnt: string;
};

const ROWS: readonly Row[] = [
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
  const ogParameters = {
    description:
      "VLLNT UI vs assistant-ui: a full AI-first design system you own via the shadcn CLI vs a focused chat-thread library. Honest comparison of scope, install, and theming.",
    title: "VLLNT UI vs assistant-ui",
    type: "page" as const,
  };

  return {
    alternates: {
      canonical: canonical(PATHNAME, locale),
      languages: languageAlternates(PATHNAME),
    },
    description: ogParameters.description,
    openGraph: generateOGMetadata(ogParameters, {
      locale,
      pathname: PATHNAME,
    }),
    title: "VLLNT UI vs assistant-ui | VLLNT UI",
    twitter: generateTwitterMetadata(ogParameters),
  };
}

export default async function VsAssistantUiPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <script
        {...jsonLdScriptAttributes(
          breadcrumbLd([
            { name: "Home", url: SITE_URL },
            { name: "VLLNT UI vs assistant-ui", url: `${SITE_URL}${PATHNAME}` },
          ]),
        )}
      />
      <Sidebar sections={getSidebarSections(undefined, locale)} />
      <main className="flex-1 overflow-y-auto bg-background">
        <div className="mx-auto max-w-4xl px-4 py-16 lg:px-8">
          <h1 className="text-4xl font-semibold leading-tight md:text-5xl">
            VLLNT UI vs assistant-ui
          </h1>
          <p className="mt-6 text-lg text-muted-foreground">
            assistant-ui gives you an opinionated chat thread fast. VLLNT UI is
            a broader, agent-first design system: the same chat surfaces, plus
            the tool calls, agent activity, citations, artifacts, and product UI
            an AI-first app needs — all installed via the shadcn CLI so you own
            the source.
          </p>

          <div className="mt-12 overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-border text-left">
                  <th className="py-3 pr-4 font-medium">Attribute</th>
                  <th className="py-3 pr-4 font-medium">VLLNT UI</th>
                  <th className="py-3 font-medium">assistant-ui</th>
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
              href={localizePathname("/ai", locale)}
            >
              Explore all AI agent components
            </Link>
          </div>
        </div>
        <Footer />
      </main>
    </>
  );
}
