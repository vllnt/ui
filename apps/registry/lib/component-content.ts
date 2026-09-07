import { readFile } from "node:fs/promises";
import path from "node:path";

import matter from "gray-matter";
import { z } from "zod";

import { type Locale, routing } from "@/i18n/routing";

/**
 * Per-component, per-locale SEO content lives at
 * `content/components/<slug>/<locale>.mdx`. Each file is a fully authored,
 * localized page body that embeds the component-MDX kit (`<Preview>`,
 * `<Install>`, `<Props>`, `<Stories>`) so every component page is unique,
 * crawlable prose rather than a thin auto-generated shell.
 */
const COMPONENTS_CONTENT_DIR = path.join(
  process.cwd(),
  "content",
  "components",
);

export const componentFrontmatterSchema = z.object({
  description: z.string().min(1),
  keywords: z.array(z.string()).optional(),
  title: z.string().min(1),
});

export type ComponentFrontmatter = z.infer<typeof componentFrontmatterSchema>;

export type ComponentContent = {
  content: string;
  frontmatter: ComponentFrontmatter;
  locale: Locale;
};

async function readIfPresent(filePath: string): Promise<string | undefined> {
  try {
    return await readFile(filePath, "utf8");
  } catch {
    return undefined;
  }
}

function filePath(slug: string, locale: Locale): string {
  return path.join(COMPONENTS_CONTENT_DIR, slug, `${locale}.mdx`);
}

async function readComponentContent(
  slug: string,
  locale: Locale,
): Promise<ComponentContent | undefined> {
  const localized = await readIfPresent(filePath(slug, locale));
  const raw =
    localized ??
    (locale === routing.defaultLocale
      ? undefined
      : await readIfPresent(filePath(slug, routing.defaultLocale)));

  if (raw === undefined) {
    return undefined;
  }

  const resolvedLocale =
    localized === undefined ? routing.defaultLocale : locale;
  const { content, data } = matter(raw);

  return {
    content,
    frontmatter: componentFrontmatterSchema.parse(data),
    locale: resolvedLocale,
  };
}

/**
 * Content is immutable for the lifetime of a build, and the component grids
 * resolve every component on every listing route. Cache parsed content so the
 * build reads each MDX file once instead of once per page that lists it.
 */
const contentCache = new Map<string, Promise<ComponentContent | undefined>>();

/**
 * Resolve the localized MDX for a component, falling back to the default locale.
 * Returns `undefined` when a component has no MDX yet (the page then renders its
 * data-driven fallback), so the feature can roll out incrementally.
 */
export async function getComponentContent(
  slug: string,
  locale: Locale = routing.defaultLocale,
): Promise<ComponentContent | undefined> {
  const key = `${locale}:${slug}`;
  const cached = contentCache.get(key);

  if (cached) {
    return cached;
  }

  const pending = readComponentContent(slug, locale);
  contentCache.set(key, pending);

  return pending;
}
