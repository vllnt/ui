import type { Metadata } from "next";
import Link from "next/link";

import {
  ComparisonPage,
  comparisonPageMetadata,
  type ComparisonRow,
} from "@/components/comparison-page/comparison-page";
import type { Locale } from "@/i18n/routing";
import { resolveLocaleParameters } from "@/lib/locale";
import { localizePathname } from "@/lib/seo";
import { getComponentCount, getLibraryVersion } from "@/lib/stats";

type Props = {
  readonly params: Promise<{ locale: Locale }>;
};

const PATHNAME = "/vs/shadcn";
const TITLE = "VLLNT UI vs shadcn/ui";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;

  return comparisonPageMetadata({
    description:
      "VLLNT UI vs shadcn/ui — registry format, component count, agent surface, theming, accessibility. Honest comparison.",
    locale,
    pathname: PATHNAME,
    title: TITLE,
  });
}

function buildRows(componentCount: number): readonly ComparisonRow[] {
  return [
    {
      attribute: "Component count",
      other: "~50 components",
      vllnt: `${componentCount} components`,
      winner: "vllnt",
    },
    {
      attribute: "Install model",
      other: "shadcn CLI against ui.shadcn.com/r",
      vllnt: "shadcn CLI against /r/<name>.json",
      winner: "even",
    },
    {
      attribute: "You own the source after install",
      other: "Yes",
      vllnt: "Yes",
      winner: "even",
    },
    {
      attribute: "Sibling-component resolution",
      other: "All source inlined per component",
      vllnt: "Hybrid: leaf source + @vllnt/ui peer dep for siblings",
      winner: "vllnt",
    },
    {
      attribute: "/llms.txt agent index",
      other: "No",
      vllnt: "Yes — llmstxt.org compliant",
      winner: "vllnt",
    },
    {
      attribute: "MCP server",
      other: "No",
      vllnt: "Yes — ui.vllnt.ai/mcp (search/get/list tools)",
      winner: "vllnt",
    },
    {
      attribute: "Per-component a11y schema in JSON",
      other: "No",
      vllnt: "Yes — keyboard map, ARIA roles, focus model",
      winner: "vllnt",
    },
    {
      attribute: "Per-component examples in JSON",
      other: "No",
      vllnt: "Yes — code-as-data, agent-readable",
      winner: "vllnt",
    },
    {
      attribute: "Per-component props schema in JSON",
      other: "No",
      vllnt: "Yes — TSDoc-shaped",
      winner: "vllnt",
    },
    {
      attribute: "version + stability per component",
      other: "No",
      vllnt: "Yes (stable / beta / experimental / deprecated)",
      winner: "vllnt",
    },
    {
      attribute: "Theming",
      other: "CSS variables",
      vllnt: "CSS variables + design tokens (DESIGN.md)",
      winner: "vllnt",
    },
    {
      attribute: "Accessibility primitives",
      other: "Radix UI",
      vllnt: "Radix UI",
      winner: "even",
    },
    {
      attribute: "Variant system",
      other: "CVA",
      vllnt: "CVA",
      winner: "even",
    },
    {
      attribute: "Community size",
      other: "Massive — millions of installs",
      vllnt: "Smaller, growing",
      winner: "other",
    },
    {
      attribute: "Namespace recognition",
      other: "shadcn (industry standard)",
      vllnt: "@vllnt/ui (newer)",
      winner: "other",
    },
    {
      attribute: "Tutorials + content",
      other: "Extensive — countless videos, blogs, courses",
      vllnt: "Limited (young project)",
      winner: "other",
    },
    {
      attribute: "Templates / starter kits",
      other: "Many official + community templates",
      vllnt:
        "Curated app templates for Next.js, dashboards, SaaS, AI chat, and docs",
      winner: "even",
    },
    {
      attribute: "License",
      other: "MIT",
      vllnt: "MIT",
      winner: "even",
    },
  ];
}

export default async function VsShadcnPage({ params }: Props) {
  const { locale } = await resolveLocaleParameters(params);
  const componentCount = getComponentCount();
  const version = getLibraryVersion();

  return (
    <ComparisonPage
      afterTable={
        <div className="prose prose-lg dark:prose-invert mt-12 max-w-none">
          <h2>When to pick which</h2>
          <p>
            <strong>Pick shadcn/ui</strong> when you want the most-validated
            choice, need a large pool of tutorials, or are building something
            that benefits from being &ldquo;just shadcn&rdquo;.
          </p>
          <p>
            <strong>Pick VLLNT UI</strong> when you need components beyond the
            shadcn core (timelines, maps, AI compounds, runtime overlays, canvas
            primitives), when AI agents are part of your authoring flow, or when
            you want the registry data structured enough to query
            programmatically.
          </p>
          <p>
            The honest answer: many projects use both. shadcn/ui as the
            baseline, VLLNT UI for the families shadcn doesn&rsquo;t cover. Same
            install model: they coexist cleanly.
          </p>
        </div>
      }
      competitorLabel="shadcn/ui"
      eyebrow={`Comparison · v${version}`}
      intro={
        <div className="prose prose-lg dark:prose-invert mt-6 max-w-none">
          <h2>TLDR</h2>
          <p>
            shadcn/ui is the industry standard. VLLNT UI is a younger sibling
            that takes the same registry idea further: more components, an
            agent-first surface (<code>/llms.txt</code>, <code>/mcp</code>,
            richer JSON descriptors), and a hybrid install model that dedupes
            shared primitives via <code>@vllnt/ui</code>.
          </p>
          <p>
            If you want maximum community signal and the largest pool of
            third-party tutorials and templates, shadcn/ui wins. If you want the
            broadest curated component set and a registry that AI agents can
            read directly, VLLNT UI wins.
          </p>
          <p>
            VLLNT UI now includes a{" "}
            <Link href={localizePathname("/templates", locale)}>
              starter kit gallery
            </Link>{" "}
            for finished app shells built from the registry.
          </p>
        </div>
      }
      locale={locale}
      pathname={PATHNAME}
      rows={buildRows(componentCount)}
      title={TITLE}
    />
  );
}
