import { readFile } from "node:fs/promises";
import path from "node:path";

import {
  generateLlmsFullText,
  type LlmsFullPage,
  type LlmsFullSection,
} from "@vllnt/next-llms";

import { getLatestReleaseRecords } from "@/lib/changelog";
import { getDesignGuideMarkdown } from "@/lib/design-guide";
import { registry, type RegistryComponent } from "@/lib/registry";

import { DOCS_PAGES, getDocsPath } from "../../lib/docs-pages";
import { getTemplatePath, TEMPLATES } from "../../lib/templates";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://ui.vllnt.com";
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

function getRegistryComponents(): readonly RegistryComponent[] {
  return registry.items;
}

function stripFrontmatter(source: string): string {
  if (!source.startsWith("---")) return source;
  const end = source.indexOf("\n---", 3);
  if (end === -1) return source;
  return source.slice(end + 4).replace(/^\n+/, "");
}

async function readDocumentPage(slug: string): Promise<string> {
  const file = path.join(process.cwd(), "content", "pages", `${slug}.mdx`);
  try {
    const raw = await readFile(file, "utf8");
    return stripFrontmatter(raw).trim();
  } catch (error) {
    console.error(`[llms-full.txt] failed to read ${file}`, error);
    return "";
  }
}

function buildSummary(items: readonly RegistryComponent[]): string {
  return (
    "One-fetch, complete agent context for the VLLNT UI registry. " +
    `${items.length} components, install via shadcn CLI against /r/<name>.json. ` +
    `Site: ${SITE_URL}`
  );
}

const INSTALL_DETAILS = [
  "## Install",
  "",
  "```bash",
  `pnpm dlx shadcn@latest add ${SITE_URL}/r/<name>.json`,
  `# Or with npm: npx shadcn@latest add ${SITE_URL}/r/<name>.json`,
  "```",
].join("\n");

async function buildGuidePages(): Promise<LlmsFullPage[]> {
  const entries = await Promise.all(
    REFERENCE_PAGES.map(async (page) => ({
      content: await readDocumentPage(page.slug),
      title: page.title,
      url: `${SITE_URL}${page.href}`,
    })),
  );
  return entries.filter((entry) => entry.content.length > 0);
}

async function buildDesignPage(): Promise<LlmsFullPage> {
  const designGuide = await getDesignGuideMarkdown();
  return {
    content: [
      `Raw: ${SITE_URL}/DESIGN.md`,
      `Tokens: ${SITE_URL}/r/design.json`,
      "",
      designGuide,
    ].join("\n"),
    title: "Design Guide",
    url: `${SITE_URL}/design`,
  };
}

async function buildReleasePages(): Promise<LlmsFullPage[]> {
  const releases = await getLatestReleaseRecords(5);
  return releases.map((release) => ({
    content: [
      `- Version: \`${release.version}\``,
      `- Page: ${SITE_URL}/releases#${release.anchor}`,
      `- GitHub: ${release.url}`,
      ...(release.date ? [`- Date: ${release.date}`] : []),
      "",
      release.notes,
    ].join("\n"),
    title: release.title,
  }));
}

function buildTemplatePages(): LlmsFullPage[] {
  return TEMPLATES.map((template) => ({
    content: [
      `- Slug: \`${template.slug}\``,
      `- Page: ${SITE_URL}${getTemplatePath(template)}`,
      `- Audience: ${template.audience}`,
      `- Components: ${template.components.join(", ")}`,
    ].join("\n"),
    title: template.title,
  }));
}

function buildComponentPages(
  items: readonly RegistryComponent[],
): LlmsFullPage[] {
  return [...items]
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((item) => ({
      content: [
        `- Slug: \`${item.name}\``,
        `- Category: \`${item.category ?? ""}\``,
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
      ].join("\n"),
      title: item.title,
    }));
}

async function buildLlmsFullTxt(): Promise<string> {
  const items = getRegistryComponents();
  const [guidePages, designPage, releasePages] = await Promise.all([
    buildGuidePages(),
    buildDesignPage(),
    buildReleasePages(),
  ]);
  const templatePages = buildTemplatePages();

  const sections: LlmsFullSection[] = [
    ...(guidePages.length > 0 ? [{ pages: guidePages, title: "Guides" }] : []),
    { pages: [designPage], title: "Design" },
    ...(releasePages.length > 0
      ? [{ pages: releasePages, title: "Latest Release Notes" }]
      : []),
    ...(templatePages.length > 0
      ? [{ pages: templatePages, title: "Templates" }]
      : []),
    { pages: buildComponentPages(items), title: "Components" },
  ];

  return generateLlmsFullText({
    details: INSTALL_DETAILS,
    sections,
    summary: buildSummary(items),
    title: "VLLNT UI - Full Reference",
  });
}

export const dynamic = "force-static";
export const revalidate = 86_400;
// Pin to the Node.js runtime: readDocumentPage relies on fs and process.cwd(),
// which are unavailable on the edge runtime.
export const runtime = "nodejs";

async function getLlmsFullTxt(): Promise<Response> {
  const body = await buildLlmsFullTxt();
  return new Response(body, { headers: TEXT_HEADERS });
}

export { getLlmsFullTxt as GET };
