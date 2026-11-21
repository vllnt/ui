import type { Locale } from "@/i18n/routing";
import { getComponentContent } from "@/lib/component-content";
import { getPageContent } from "@/lib/content";
import { getDesignGuideMarkdown } from "@/lib/design-guide";
import { DOCS_PAGES } from "@/lib/docs-pages";
import { buildLlmsTxt } from "@/lib/llms";
import { stripLeadingMarkdownHeading } from "@/lib/markdown";
import {
  type MarkdownTarget,
  markdownTarget,
} from "@/lib/markdown-negotiation";
import { findComponent, registry } from "@/lib/registry";
import { canonical } from "@/lib/seo";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://ui.vllnt.com";

/** Component MDX embeds `<Preview />`, `<Install />`, `<Code />` and `<Stories />`, which the browser renders at run time. */
const COMPONENT_TAG = /^<[A-Z][A-Za-z]*\s*\/>\s*$/gm;

function titled(title: string, description: string, body: string): string {
  return [`# ${title}`, description, body.trim()].filter(Boolean).join("\n\n");
}

/** Component MDX is an introduction followed by `##` sections made of those tags. */
function introduction(content: string): string {
  return (content.split(/^## /m)[0] ?? "").replaceAll(COMPONENT_TAG, "");
}

async function componentMarkdown(
  slug: string,
  locale: Locale,
): Promise<string> {
  const component = findComponent(slug);
  const localized = await getComponentContent(slug, locale);
  const registryUrl = `${SITE_URL}/r/${slug}.json`;
  const details = [
    `- Category: ${component?.category ?? "utility"}`,
    `- Platforms: ${component?.platforms.join(", ") ?? "web"}`,
    `- Registry item, with source files: ${registryUrl}`,
  ].join("\n");

  return [
    titled(
      localized?.frontmatter.title ?? component?.title ?? slug,
      localized?.frontmatter.description ?? component?.description ?? "",
      introduction(localized?.content ?? ""),
    ),
    `## Install\n\n\`\`\`bash\npnpm dlx shadcn@latest add ${registryUrl}\n\`\`\``,
    `## Details\n\n${details}`,
  ].join("\n\n");
}

/** The docs index: every docs page with its summary and URL. */
function docsIndexMarkdown(locale: Locale): string {
  const pages = DOCS_PAGES.map(
    (page) =>
      `- [${page.title}](${canonical(`/docs/${page.slug}`, locale)}): ${page.description}`,
  ).join("\n");

  return titled(
    "Docs",
    "Guides for installing, theming and using VLLNT UI, for people and AI agents.",
    pages,
  );
}

/** The component catalog: every registry item by category, with its summary and URL. */
function componentsIndexMarkdown(locale: Locale): string {
  const items = [...registry.items].sort((a, b) =>
    a.name.localeCompare(b.name),
  );
  const categoryOf = (item: (typeof items)[number]) =>
    item.category ?? "utility";
  const sections = [...new Set(items.map(categoryOf))]
    .sort()
    .map((category) => {
      const lines = items
        .filter((item) => categoryOf(item) === category)
        .map(
          (item) =>
            `- [${item.title}](${canonical(`/components/${item.name}`, locale)}): ${item.description ?? ""} Platforms: ${item.platforms.join(", ")}.`,
        );

      return `## ${category}\n\n${lines.join("\n")}`;
    })
    .join("\n\n");

  return titled(
    "Components",
    `${registry.items.length} components. Each one installs with \`pnpm dlx shadcn@latest add ${SITE_URL}/r/<name>.json\`.`,
    sections,
  );
}

async function pageMarkdown(slug: string, locale: Locale): Promise<string> {
  const { content, frontmatter } = await getPageContent(slug, locale);

  return titled(
    frontmatter.title,
    frontmatter.description,
    stripLeadingMarkdownHeading(content),
  );
}

function targetMarkdown(
  target: MarkdownTarget,
  locale: Locale,
): Promise<string> | string {
  switch (target.kind) {
    case "component":
      return componentMarkdown(target.slug, locale);

    case "components-index":
      return componentsIndexMarkdown(locale);

    case "design":
      return getDesignGuideMarkdown();

    case "docs":
      return pageMarkdown(`docs/${target.slug}`, locale);

    case "docs-index":
      return docsIndexMarkdown(locale);

    case "home":
      return buildLlmsTxt();

    case "vision":
      return pageMarkdown("vision", locale);
  }
}

/**
 * The markdown twin of a public page: the same content the HTML page renders,
 * from its authored sources, ending with the page's canonical URL.
 *
 * @param pathname - public pathname without a locale prefix (`/docs/cli`)
 * @param locale - locale of the page
 * @returns The markdown, or `undefined` when the page has no markdown twin
 * @example
 * await getMarkdownPage("/components/button", "fr");
 */
export async function getMarkdownPage(
  pathname: string,
  locale: Locale,
): Promise<string | undefined> {
  const target = markdownTarget(pathname);
  if (!target) return undefined;
  const body = await targetMarkdown(target, locale);

  return `${body.trim()}\n\n---\n\nCanonical page: ${canonical(pathname, locale)}\n`;
}
