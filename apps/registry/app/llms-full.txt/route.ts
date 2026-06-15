import { getLatestReleaseRecords } from "@/lib/changelog";
import { getPageContent } from "@/lib/content";
import { getDesignGuideMarkdown } from "@/lib/design-guide";
import { getRegistryItems } from "@/lib/registry";

import { DOCS_PAGES, getDocsPath } from "../../lib/docs-pages";
import { getTemplatePath, TEMPLATES } from "../../lib/templates";

import type { RegistryComponent } from "@/types/registry";
import { SITE_URL } from "@/lib/seo";

const TEXT_HEADERS = new Headers([
  [
    "Cache-Control",
    "public, max-age=0, s-maxage=86400, stale-while-revalidate=604800",
  ],
  ["Content-Type", "text/plain; charset=utf-8"],
]);

const REFERENCE_PAGES: readonly {
  href: string;
  slug: string;
  title: string;
}[] = [
  { href: "/", slug: "home", title: "Get Started" },
  { href: "/docs", slug: "docs", title: "Documentation" },
  ...DOCS_PAGES.map((page) => ({
    href: getDocsPath(page),
    slug: `docs/${page.slug}`,
    title: page.title,
  })),
  { href: "/philosophy", slug: "philosophy", title: "Philosophy" },
  { href: "/components", slug: "components", title: "Components Overview" },
];

async function readDocumentPage(slug: string): Promise<string> {
  try {
    const { content } = await getPageContent(slug);
    return content.trim();
  } catch {
    return "";
  }
}

function buildIntroLines(items: readonly RegistryComponent[]): readonly string[] {
  return [
    "# VLLNT UI - Full Reference",
    "",
    "> One-fetch, complete agent context for the VLLNT UI registry. " +
      `${items.length} components, install via shadcn CLI against /r/<name>.json. ` +
      `Site: ${SITE_URL}`,
    "",
  ];
}

function buildInstallLines(): readonly string[] {
  return [
    "## Install",
    "",
    "```bash",
    `pnpm dlx shadcn@latest add ${SITE_URL}/r/<name>.json`,
    `# Or with npm: npx shadcn@latest add ${SITE_URL}/r/<name>.json`,
    "```",
    "",
  ];
}

async function buildDocumentLines(): Promise<readonly string[]> {
  const pageSections = await Promise.all(
    REFERENCE_PAGES.map(async (page) => {
      const body = await readDocumentPage(page.slug);
      if (!body) return [];
      const source = `${SITE_URL}${page.href}`;
      return [`## ${page.title}`, "", `Source: ${source}`, "", body, ""];
    }),
  );

  return pageSections.flat();
}

async function buildDesignLines(): Promise<readonly string[]> {
  const designGuide = await getDesignGuideMarkdown();
  return [
    "## Design Guide",
    "",
    `Source: ${SITE_URL}/design`,
    `Raw: ${SITE_URL}/DESIGN.md`,
    `Tokens: ${SITE_URL}/r/design.json`,
    "",
    designGuide,
    "",
  ];
}

async function buildReleaseLines(): Promise<readonly string[]> {
  const releases = await getLatestReleaseRecords(5);
  if (releases.length === 0) return [];

  return [
    "## Latest Release Notes",
    "",
    `Full release cards are available at ${SITE_URL}/releases and feeds at ${SITE_URL}/rss.xml or ${SITE_URL}/atom.xml.`,
    "",
    ...releases.flatMap((release) => [
      `### ${release.title}`,
      "",
      `- Version: \`${release.version}\``,
      `- Page: ${SITE_URL}/releases#${release.anchor}`,
      `- GitHub: ${release.url}`,
      ...(release.date ? [`- Date: ${release.date}`] : []),
      "",
      release.notes,
      "",
    ]),
  ];
}

function buildTemplateLines(): readonly string[] {
  if (TEMPLATES.length === 0) return [];

  return [
    "## Templates",
    "",
    "Starter kits pairing complete app shapes with component lists and source paths.",
    "",
    ...TEMPLATES.flatMap((template) => [
      `### ${template.title}`,
      "",
      `- Slug: \`${template.slug}\``,
      `- Page: ${SITE_URL}${getTemplatePath(template)}`,
      `- Audience: ${template.audience}`,
      `- Components: ${template.components.join(", ")}`,
      "",
    ]),
  ];
}

function buildComponentLines(item: RegistryComponent): readonly string[] {
  return [
    `### ${item.title}`,
    "",
    `- Slug: \`${item.name}\``,
    `- Category: \`${item.category ?? "uncategorized"}\``,
    `- Description: ${item.description ?? ""}`,
    `- Page: ${SITE_URL}/components/${item.name}`,
    `- Schema: ${SITE_URL}/r/${item.name}.json`,
    ...(item.dependencies?.length
      ? [`- npm deps: ${item.dependencies.join(", ")}`]
      : []),
    ...(item.registryDependencies?.length
      ? [`- registry deps: ${item.registryDependencies.join(", ")}`]
      : []),
    `- Install: \`pnpm dlx shadcn@latest add ${SITE_URL}/r/${item.name}.json\``,
    "",
  ];
}

function buildComponentsReferenceLines(
  items: readonly RegistryComponent[],
): readonly string[] {
  return [
    "## Components",
    "",
    `${items.length} components total. Each entry links to a machine-readable JSON descriptor at /r/<name>.json.`,
    "",
    ...[...items]
      .sort((a, b) => a.name.localeCompare(b.name))
      .flatMap(buildComponentLines),
  ];
}

async function buildLlmsFullTxt(): Promise<string> {
  const items = getRegistryItems();
  const documentLines = await buildDocumentLines();
  const designLines = await buildDesignLines();
  const releaseLines = await buildReleaseLines();
  const templateLines = buildTemplateLines();

  return [
    ...buildIntroLines(items),
    ...buildInstallLines(),
    ...documentLines,
    ...designLines,
    ...releaseLines,
    ...templateLines,
    ...buildComponentsReferenceLines(items),
  ].join("\n");
}

export const dynamic = "force-static";
export const revalidate = 86_400;

async function getLlmsFullTxt(): Promise<Response> {
  const body = await buildLlmsFullTxt();
  return new Response(body, { headers: TEXT_HEADERS });
}

export { getLlmsFullTxt as GET };
