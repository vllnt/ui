/* eslint-disable @typescript-eslint/naming-convention, functional/no-loop-statements, max-lines-per-function */

import { readFile } from "node:fs/promises";
import path from "node:path";

import registry from "../../registry.json";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://ui.vllnt.ai";

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

function stripFrontmatter(source: string): string {
  if (!source.startsWith("---")) return source;
  const end = source.indexOf("\n---", 3);
  if (end === -1) return source;
  return source.slice(end + 4).replace(/^\n+/, "");
}

async function readDocumentPage(slug: string): Promise<string> {
  const file = path.join(process.cwd(), "content", "pages", slug, "en.mdx");
  try {
    const raw = await readFile(file, "utf8");
    return stripFrontmatter(raw).trim();
  } catch {
    return "";
  }
}

async function buildLlmsFullTxt(): Promise<string> {
  const items = (registry as { readonly items: readonly RegistryItem[] }).items;

  const lines: string[] = [];

  lines.push("# VLLNT UI — Full Reference");
  lines.push("");
  lines.push(
    "> One-fetch, complete agent context for the VLLNT UI registry. " +
      `${items.length} components, install via shadcn CLI against /r/<name>.json. ` +
      `Site: ${SITE_URL}`,
  );
  lines.push("");

  lines.push("## Install");
  lines.push("");
  lines.push("```bash");
  lines.push(`pnpm dlx shadcn@latest add ${SITE_URL}/r/<name>.json`);
  lines.push(`# Or with npm: npx shadcn@latest add ${SITE_URL}/r/<name>.json`);
  lines.push("```");
  lines.push("");

  for (const page of DOC_PAGES) {
    const body = await readDocumentPage(page.slug);
    if (!body) continue;
    lines.push(`## ${page.title}`);
    lines.push("");
    lines.push(`Source: ${SITE_URL}/${page.slug === "home" ? "" : page.slug}`);
    lines.push("");
    lines.push(body);
    lines.push("");
  }

  lines.push("## Components");
  lines.push("");
  lines.push(
    `${items.length} components total. Each entry links to a machine-readable JSON descriptor at /r/<name>.json.`,
  );
  lines.push("");

  for (const item of [...items].sort((a, b) => a.name.localeCompare(b.name))) {
    lines.push(`### ${item.title}`);
    lines.push("");
    lines.push(`- Slug: \`${item.name}\``);
    lines.push(`- Category: \`${item.category}\``);
    lines.push(`- Description: ${item.description}`);
    lines.push(`- Page: ${SITE_URL}/components/${item.name}`);
    lines.push(`- Schema: ${SITE_URL}/r/${item.name}.json`);
    if (item.dependencies && item.dependencies.length > 0) {
      lines.push(`- npm deps: ${item.dependencies.join(", ")}`);
    }
    if (item.registryDependencies && item.registryDependencies.length > 0) {
      lines.push(`- registry deps: ${item.registryDependencies.join(", ")}`);
    }
    lines.push(
      `- Install: \`pnpm dlx shadcn@latest add ${SITE_URL}/r/${item.name}.json\``,
    );
    lines.push("");
  }

  return lines.join("\n");
}

export const dynamic = "force-static";
export const revalidate = 86_400;

export async function GET(): Promise<Response> {
  const body = await buildLlmsFullTxt();
  return new Response(body, {
    headers: {
      "Cache-Control":
        "public, max-age=0, s-maxage=86400, stale-while-revalidate=604800",
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
}
