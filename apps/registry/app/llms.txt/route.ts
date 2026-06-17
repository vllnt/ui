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

function buildIntroLines(
  items: readonly RegistryComponent[],
): readonly string[] {
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
    ...DOCS_PAGES.map(
      (page) =>
        `- [${page.title}](${SITE_URL}${getDocsPath(page)}): ${page.description}`,
    ),
    `- [Philosophy](${SITE_URL}/philosophy): design principles and component patterns`,
    `- [Design guide](${SITE_URL}/design): brand, tokens, accessibility, and UI rules`,
    `- [Components index](${SITE_URL}/components): browse all components by category`,
    `- [Templates](${SITE_URL}/templates): starter kits for full VLLNT UI apps`,
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
    `- [Design tokens](${SITE_URL}/r/design.json): machine-readable VLLNT UI token contract`,
    `- [Design guide (raw)](${SITE_URL}/DESIGN.md): canonical brand and design rules as raw markdown`,
    `- [Sitemap](${SITE_URL}/sitemap.xml): every public route, refreshed per deploy`,
    "- Install command: `pnpm dlx shadcn@latest add " +
      `${SITE_URL}/r/<name>.json` +
      "`",
    "",
  ];
}

function buildCategoryLines(
  category: string,
  grouped: ReadonlyMap<string, readonly RegistryComponent[]>,
): readonly string[] {
  const bucket = grouped.get(category);
  if (!bucket || bucket.length === 0) return [];
  const label = CATEGORY_LABEL.get(category) ?? category;
  const itemLines = [...bucket]
    .sort((a, b) => a.name.localeCompare(b.name))
    .map(
      (item) =>
        `- [${item.title}](${SITE_URL}/components/${item.name}): ${item.description ?? ""}`,
    );

  return [`## Components - ${label}`, "", ...itemLines, ""];
}

function buildComponentLines(
  items: readonly RegistryComponent[],
): readonly string[] {
  const grouped = groupItems(items);
  return getSortedCategories(grouped).flatMap((category) =>
    buildCategoryLines(category, grouped),
  );
}

function buildLlmsTxt(): string {
  const items = getRegistryComponents();
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
