import {
  generateLlmsText,
  type LlmsLink,
  type LlmsSection,
} from "@vllnt/next-llms";

import { registry, type RegistryComponent } from "@/lib/registry";

import { DOCS_PAGES, getDocsPath } from "../../lib/docs-pages";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://ui.vllnt.ai";
const TEXT_HEADERS = new Headers([
  [
    "Cache-Control",
    "public, max-age=0, s-maxage=86400, stale-while-revalidate=604800",
  ],
  ["Content-Type", "text/plain; charset=utf-8"],
]);

const CATEGORY_ORDER: readonly string[] = [
  "core",
  "form",
  "navigation",
  "overlay",
  "data",
  "data-display",
  "content",
  "ai",
  "educational",
  "learning",
  "billing",
  "utility",
];

const CATEGORY_LABEL = new Map<string, string>([
  ["ai", "AI"],
  ["billing", "Billing & Plans"],
  ["content", "Content"],
  ["core", "Core primitives"],
  ["data", "Data"],
  ["data-display", "Data display"],
  ["educational", "Educational"],
  ["form", "Form"],
  ["learning", "Learning"],
  ["navigation", "Navigation"],
  ["overlay", "Overlay"],
  ["utility", "Utility"],
]);

const INSTALL_DETAILS =
  "Install any component with the shadcn CLI: " +
  `\`pnpm dlx shadcn@latest add ${SITE_URL}/r/<name>.json\``;

const DOCS_SECTION: LlmsSection = {
  links: [
    {
      notes: "install and use any component",
      title: "Get Started",
      url: `${SITE_URL}/`,
    },
    {
      notes: "theming, registry usage, conventions",
      title: "Documentation",
      url: `${SITE_URL}/docs`,
    },
    ...DOCS_PAGES.map((page) => ({
      notes: page.description,
      title: page.title,
      url: `${SITE_URL}${getDocsPath(page)}`,
    })),
    {
      notes: "design principles and component patterns",
      title: "Philosophy",
      url: `${SITE_URL}/philosophy`,
    },
    {
      notes: "brand, tokens, accessibility, and UI rules",
      title: "Design guide",
      url: `${SITE_URL}/design`,
    },
    {
      notes: "browse all components by category",
      title: "Components index",
      url: `${SITE_URL}/components`,
    },
    {
      notes: "starter kits for full VLLNT UI apps",
      title: "Templates",
      url: `${SITE_URL}/templates`,
    },
    {
      notes: "canonical Keep a Changelog release history",
      title: "Changelog",
      url: `${SITE_URL}/changelog`,
    },
    {
      notes: "versioned release cards, GitHub notes, and RSS links",
      title: "Releases",
      url: `${SITE_URL}/releases`,
    },
    {
      notes: "release feed for notification and agent polling",
      title: "RSS feed",
      url: `${SITE_URL}/rss.xml`,
    },
  ],
  title: "Docs",
};

const REGISTRY_SECTION: LlmsSection = {
  links: [
    {
      notes: "full machine-readable list of all components",
      title: "Registry index",
      url: `${SITE_URL}/r/registry.json`,
    },
    {
      notes: "machine-readable VLLNT UI token contract",
      title: "Design tokens",
      url: `${SITE_URL}/r/design.json`,
    },
    {
      notes: "canonical brand and design rules as raw markdown",
      title: "Design guide (raw)",
      url: `${SITE_URL}/DESIGN.md`,
    },
    {
      notes: "every public route, refreshed per deploy",
      title: "Sitemap",
      url: `${SITE_URL}/sitemap.xml`,
    },
  ],
  title: "Registry API",
};

function getRegistryComponents(): readonly RegistryComponent[] {
  return registry.items;
}

function groupItems(
  items: readonly RegistryComponent[],
): ReadonlyMap<string, readonly RegistryComponent[]> {
  return items.reduce((groups, item) => {
    const category = item.category ?? "utility";
    const bucket = groups.get(category) ?? [];
    groups.set(category, [...bucket, item]);
    return groups;
  }, new Map<string, readonly RegistryComponent[]>());
}

function getSortedCategories(
  grouped: ReadonlyMap<string, readonly RegistryComponent[]>,
): readonly string[] {
  return [
    ...CATEGORY_ORDER.filter((category) => grouped.has(category)),
    ...[...grouped.keys()]
      .filter((category) => !CATEGORY_ORDER.includes(category))
      .sort(),
  ];
}

function buildSummary(items: readonly RegistryComponent[]): string {
  return (
    "Agent-first React component registry. " +
    `${items.length} accessible components built on Radix UI, Tailwind CSS, and CVA. ` +
    "Install via the shadcn CLI against any /r/<name>.json endpoint."
  );
}

function buildComponentSections(
  items: readonly RegistryComponent[],
): readonly LlmsSection[] {
  const grouped = groupItems(items);
  return getSortedCategories(grouped).flatMap((category) => {
    const bucket = grouped.get(category);
    if (!bucket || bucket.length === 0) return [];
    const label = CATEGORY_LABEL.get(category) ?? category;
    const links: LlmsLink[] = [...bucket]
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((item) => ({
        notes: item.description,
        title: item.title,
        url: `${SITE_URL}/components/${item.name}`,
      }));
    return [{ links, title: `Components - ${label}` }];
  });
}

function buildLlmsTxt(): string {
  const items = getRegistryComponents();
  return generateLlmsText({
    details: INSTALL_DETAILS,
    sections: [
      DOCS_SECTION,
      REGISTRY_SECTION,
      ...buildComponentSections(items),
    ],
    summary: buildSummary(items),
    title: "VLLNT UI",
  });
}

export const dynamic = "force-static";
export const revalidate = 86_400;

function getLlmsTxt(): Response {
  return new Response(buildLlmsTxt(), { headers: TEXT_HEADERS });
}

export { getLlmsTxt as GET };
