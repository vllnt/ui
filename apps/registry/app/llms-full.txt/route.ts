import { readFile } from "node:fs/promises";
import path from "node:path";

import { getLatestReleaseRecords } from "@/lib/changelog";

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
  readonly dependencies?: readonly string[];
  readonly description: string;
  readonly name: string;
  readonly registryDependencies?: readonly string[];
  readonly title: string;
};

const DOC_PAGES: readonly { slug: string; title: string }[] = [
  { slug: "home", title: "Get Started" },
  { slug: "docs", title: "Documentation" },
  { slug: "philosophy", title: "Philosophy" },
  { slug: "components", title: "Components Overview" },
];

function getRegistryItems(): readonly RegistryItem[] {
  return (registry as { readonly items: readonly RegistryItem[] }).items;
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
  } catch {
    return "";
  }
}

function buildIntroLines(items: readonly RegistryItem[]): readonly string[] {
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
    DOC_PAGES.map(async (page) => {
      const body = await readDocumentPage(page.slug);
      if (!body) return [];
      const source = `${SITE_URL}/${page.slug === "home" ? "" : page.slug}`;
      return [`## ${page.title}`, "", `Source: ${source}`, "", body, ""];
    }),
  );

  return pageSections.flat();
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

function buildComponentLines(item: RegistryItem): readonly string[] {
  return [
    `### ${item.title}`,
    "",
    `- Slug: \`${item.name}\``,
    `- Category: \`${item.category}\``,
    `- Description: ${item.description}`,
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
  items: readonly RegistryItem[],
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
  const releaseLines = await buildReleaseLines();

  return [
    ...buildIntroLines(items),
    ...buildInstallLines(),
    ...documentLines,
    ...releaseLines,
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
