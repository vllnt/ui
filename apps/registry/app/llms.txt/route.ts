import { DOCS_PAGES, getDocsPath } from "../../lib/docs-pages";
import registry from "../../registry.json";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://ui.vllnt.ai";
const TEXT_HEADERS = new Headers([
  [
    "Cache-Control",
    "public, max-age=0, s-maxage=86400, stale-while-revalidate=604800",
  ],
  ["Content-Type", "text/plain; charset=utf-8"],
]);

type RegistryItem = {
  readonly category: string;
  readonly description: string;
  readonly name: string;
  readonly title: string;
};

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

function getRegistryItems(): readonly RegistryItem[] {
  return (registry as { readonly items: readonly RegistryItem[] }).items;
}

function groupItems(
  items: readonly RegistryItem[],
): ReadonlyMap<string, readonly RegistryItem[]> {
  return items.reduce((groups, item) => {
    const bucket = groups.get(item.category) ?? [];
    groups.set(item.category, [...bucket, item]);
    return groups;
  }, new Map<string, readonly RegistryItem[]>());
}

function getSortedCategories(
  grouped: ReadonlyMap<string, readonly RegistryItem[]>,
): readonly string[] {
  return [
    ...CATEGORY_ORDER.filter((category) => grouped.has(category)),
    ...[...grouped.keys()]
      .filter((category) => !CATEGORY_ORDER.includes(category))
      .sort(),
  ];
}

function buildIntroLines(items: readonly RegistryItem[]): readonly string[] {
  return [
    "# VLLNT UI",
    "",
    "> Agent-first React component registry. " +
      `${items.length} accessible components built on Radix UI, Tailwind CSS, and CVA. ` +
      "Install via the shadcn CLI against any /r/<name>.json endpoint.",
    "",
  ];
}

function buildDocumentationLines(): readonly string[] {
  return [
    "## Docs",
    "",
    `- [Get Started](${SITE_URL}/): install and use any component`,
    `- [Documentation](${SITE_URL}/docs): theming, registry usage, conventions`,
  );
  for (const page of DOCS_PAGES) {
    lines.push(
      `- [${page.title}](${SITE_URL}${getDocsPath(page)}): ${page.description}`,
    );
  }
  lines.push(
    `- [Philosophy](${SITE_URL}/philosophy): design principles and component patterns`,
    `- [Components index](${SITE_URL}/components): browse all components by category`,
    `- [Changelog](${SITE_URL}/changelog): canonical Keep a Changelog release history`,
    `- [Releases](${SITE_URL}/releases): versioned release cards, GitHub notes, and RSS links`,
    `- [RSS feed](${SITE_URL}/rss.xml): release feed for notification and agent polling`,
    "",
  ];
}

function buildRegistryLines(): readonly string[] {
  return [
    "## Registry API",
    "",
    `- [Registry index](${SITE_URL}/r/registry.json): full machine-readable list of all components`,
    `- [Sitemap](${SITE_URL}/sitemap.xml): every public route, refreshed per deploy`,
    "- Install command: `pnpm dlx shadcn@latest add " +
      `${SITE_URL}/r/<name>.json` +
      "`",
    "",
  ];
}

function buildCategoryLines(
  category: string,
  grouped: ReadonlyMap<string, readonly RegistryItem[]>,
): readonly string[] {
  const bucket = grouped.get(category);
  if (!bucket || bucket.length === 0) return [];
  const label = CATEGORY_LABEL.get(category) ?? category;
  const itemLines = [...bucket]
    .sort((a, b) => a.name.localeCompare(b.name))
    .map(
      (item) =>
        `- [${item.title}](${SITE_URL}/components/${item.name}): ${item.description}`,
    );

  return [`## Components - ${label}`, "", ...itemLines, ""];
}

function buildComponentLines(
  items: readonly RegistryItem[],
): readonly string[] {
  const grouped = groupItems(items);
  return getSortedCategories(grouped).flatMap((category) =>
    buildCategoryLines(category, grouped),
  );
}

function buildLlmsTxt(): string {
  const items = getRegistryItems();
  return [
    ...buildIntroLines(items),
    ...buildDocumentationLines(),
    ...buildRegistryLines(),
    ...buildComponentLines(items),
  ].join("\n");
}

export const dynamic = "force-static";
export const revalidate = 86_400;

function getLlmsTxt(): Response {
  return new Response(buildLlmsTxt(), { headers: TEXT_HEADERS });
}

export { getLlmsTxt as GET };
