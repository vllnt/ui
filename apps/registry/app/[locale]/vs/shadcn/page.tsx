import { Sidebar } from "@vllnt/ui";
import type { Metadata } from "next";
import Link from "next/link";
import { setRequestLocale } from "next-intl/server";

import type { Locale } from "@/i18n/routing";
import { generateOGMetadata, generateTwitterMetadata } from "@/lib/og";
import { canonical, languageAlternates, localizePathname } from "@/lib/seo";
import { getSidebarSections } from "@/lib/sidebar-sections";
import { getComponentCount, getLibraryVersion } from "@/lib/stats";

type Props = {
  readonly params: Promise<{ locale: Locale }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const ogParameters = {
    description:
      "VLLNT UI vs shadcn/ui — registry format, component count, agent surface, theming, accessibility. Honest comparison.",
    title: "VLLNT UI vs shadcn/ui",
    type: "page" as const,
  };

  return {
    alternates: {
      canonical: canonical("/vs/shadcn", locale),
      languages: languageAlternates("/vs/shadcn"),
    },
    description: ogParameters.description,
    openGraph: generateOGMetadata(ogParameters, {
      locale,
      pathname: "/vs/shadcn",
    }),
    title: ogParameters.title,
    twitter: generateTwitterMetadata(ogParameters),
  };
}

type Row = {
  readonly attribute: string;
  readonly vllnt: string;
  readonly shadcn: string;
  readonly winner?: "vllnt" | "shadcn" | "even";
};

export default async function VsShadcnPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const componentCount = getComponentCount();
  const version = getLibraryVersion();

  const rows: readonly Row[] = [
    {
      attribute: "Component count",
      vllnt: `${componentCount} components`,
      shadcn: "~50 components",
      winner: "vllnt",
    },
    {
      attribute: "Install model",
      vllnt: "shadcn CLI against /r/<name>.json",
      shadcn: "shadcn CLI against ui.shadcn.com/r",
      winner: "even",
    },
    {
      attribute: "You own the source after install",
      vllnt: "Yes",
      shadcn: "Yes",
      winner: "even",
    },
    {
      attribute: "Sibling-component resolution",
      vllnt: "Hybrid: leaf source + @vllnt/ui peer dep for siblings",
      shadcn: "All source inlined per component",
      winner: "vllnt",
    },
    {
      attribute: "/llms.txt agent index",
      vllnt: "Yes — llmstxt.org compliant",
      shadcn: "No",
      winner: "vllnt",
    },
    {
      attribute: "MCP server",
      vllnt: "Yes — ui.vllnt.ai/mcp (search/get/list tools)",
      shadcn: "No",
      winner: "vllnt",
    },
    {
      attribute: "Per-component a11y schema in JSON",
      vllnt: "Yes — keyboard map, ARIA roles, focus model",
      shadcn: "No",
      winner: "vllnt",
    },
    {
      attribute: "Per-component examples in JSON",
      vllnt: "Yes — code-as-data, agent-readable",
      shadcn: "No",
      winner: "vllnt",
    },
    {
      attribute: "Per-component props schema in JSON",
      vllnt: "Yes — TSDoc-shaped",
      shadcn: "No",
      winner: "vllnt",
    },
    {
      attribute: "version + stability per component",
      vllnt: "Yes (stable / beta / experimental / deprecated)",
      shadcn: "No",
      winner: "vllnt",
    },
    {
      attribute: "Theming",
      vllnt: "CSS variables + design tokens (DESIGN.md)",
      shadcn: "CSS variables",
      winner: "vllnt",
    },
    {
      attribute: "Accessibility primitives",
      vllnt: "Radix UI",
      shadcn: "Radix UI",
      winner: "even",
    },
    {
      attribute: "Variant system",
      vllnt: "CVA",
      shadcn: "CVA",
      winner: "even",
    },
    {
      attribute: "Community size",
      vllnt: "Smaller, growing",
      shadcn: "Massive — millions of installs",
      winner: "shadcn",
    },
    {
      attribute: "Namespace recognition",
      vllnt: "@vllnt/ui (newer)",
      shadcn: "shadcn (industry standard)",
      winner: "shadcn",
    },
    {
      attribute: "Tutorials + content",
      vllnt: "Limited (young project)",
      shadcn: "Extensive — countless videos, blogs, courses",
      winner: "shadcn",
    },
    {
      attribute: "Templates / starter kits",
      vllnt: "Curated app templates for Next.js, dashboards, SaaS, AI chat, and docs",
      shadcn: "Many official + community templates",
      winner: "even",
    },
    {
      attribute: "License",
      vllnt: "MIT",
      shadcn: "MIT",
      winner: "even",
    },
  ];

  return (
    <>
      <Sidebar sections={getSidebarSections(undefined, locale)} />
      <main className="flex-1 overflow-y-auto bg-background">
        <div className="container mx-auto max-w-4xl px-4 py-16 lg:px-8">
          <p className="text-sm uppercase tracking-wide text-muted-foreground">
            Comparison · v{version}
          </p>
          <h1 className="mt-2 text-4xl font-semibold">VLLNT UI vs shadcn/ui</h1>

          <div className="prose prose-lg dark:prose-invert mt-6 max-w-none">
            <h2>TLDR</h2>
            <p>
              shadcn/ui is the industry standard. VLLNT UI is a younger sibling
              that takes the same registry idea further: more components, an
              agent-first surface (<code>/llms.txt</code>, <code>/mcp</code>,
              richer JSON descriptors), and a hybrid install model that
              dedupes shared primitives via <code>@vllnt/ui</code>.
            </p>
            <p>
              If you want maximum community signal and the largest pool of
              third-party tutorials and templates, shadcn/ui wins. If you want
              the broadest curated component set and a registry that AI agents
              can read directly, VLLNT UI wins.
            </p>
            <p>
              VLLNT UI now includes a{" "}
              <Link href={localizePathname("/templates", locale)}>
                starter kit gallery
              </Link>{" "}
              for finished
              app shells built from the registry.
            </p>
          </div>

          <h2 className="mt-12 text-2xl font-semibold">Side-by-side</h2>
          <div className="mt-4 overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted">
                <tr>
                  <th className="p-3 text-left font-semibold">Attribute</th>
                  <th className="p-3 text-left font-semibold">VLLNT UI</th>
                  <th className="p-3 text-left font-semibold">shadcn/ui</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr className="border-t border-border" key={row.attribute}>
                    <td className="p-3 font-medium">{row.attribute}</td>
                    <td
                      className={
                        row.winner === "vllnt" ? "p-3 font-semibold" : "p-3"
                      }
                    >
                      {row.vllnt}
                    </td>
                    <td
                      className={
                        row.winner === "shadcn" ? "p-3 font-semibold" : "p-3"
                      }
                    >
                      {row.shadcn}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="prose prose-lg dark:prose-invert mt-12 max-w-none">
            <h2>When to pick which</h2>
            <p>
              <strong>Pick shadcn/ui</strong> when you want the most-validated
              choice, need a large pool of tutorials, or are building something
              that benefits from being &ldquo;just shadcn&rdquo;.
            </p>
            <p>
              <strong>Pick VLLNT UI</strong> when you need components beyond
              the shadcn core (timelines, maps, AI compounds, runtime overlays,
              canvas primitives), when AI agents are part of your authoring
              flow, or when you want the registry data structured enough to
              query programmatically.
            </p>
            <p>
              The honest answer: many projects use both. shadcn/ui as the
              baseline, VLLNT UI for the families shadcn doesn&rsquo;t cover.
              Same install model: they coexist cleanly.
            </p>
          </div>
        </div>
      </main>
    </>
  );
}
