import { readFile } from "node:fs/promises";
import path from "node:path";

import matter from "gray-matter";

import { type Locale, routing } from "@/i18n/routing";

import { type PageFrontmatter, pageFrontmatterSchema } from "./schemas";

type PageContent = {
  content: string;
  frontmatter: PageFrontmatter;
  locale: Locale;
};

const CONTENT_DIR = path.join(process.cwd(), "content", "pages");

async function readMdxFile(filePath: string): Promise<string> {
  return readFile(filePath, "utf8");
}

async function resolveRaw(
  slug: string,
  locale: Locale,
): Promise<{ locale: Locale; raw: string }> {
  const localizedPath = path.join(CONTENT_DIR, slug, `${locale}.mdx`);

  try {
    return { locale, raw: await readMdxFile(localizedPath) };
  } catch {
    if (locale !== routing.defaultLocale) {
      const defaultPath = path.join(
        CONTENT_DIR,
        slug,
        `${routing.defaultLocale}.mdx`,
      );

      try {
        return {
          locale: routing.defaultLocale,
          raw: await readMdxFile(defaultPath),
        };
      } catch {
        return resolveFlat(slug);
      }
    }

    return resolveFlat(slug);
  }
}

async function resolveFlat(
  slug: string,
): Promise<{ locale: Locale; raw: string }> {
  const flatPath = path.join(CONTENT_DIR, `${slug}.mdx`);
  return { locale: routing.defaultLocale, raw: await readMdxFile(flatPath) };
}

/**
 * Content is immutable for the lifetime of a build, and the sidebar resolves
 * every docs page on every route. Cache parsed pages so the 300+ statically
 * generated routes read each MDX file once instead of once per page.
 */
const pageCache = new Map<string, Promise<PageContent>>();

async function parsePage(slug: string, locale: Locale): Promise<PageContent> {
  const resolved = await resolveRaw(slug, locale);
  const { content, data } = matter(resolved.raw);
  const frontmatter = pageFrontmatterSchema.parse(data);

  return { content, frontmatter, locale: resolved.locale };
}

export async function getPageContent(
  slug: string,
  locale: Locale = routing.defaultLocale,
): Promise<PageContent> {
  const key = `${locale}:${slug}`;
  const cached = pageCache.get(key);

  if (cached) {
    return cached;
  }

  const pending = parsePage(slug, locale);
  pageCache.set(key, pending);

  return pending;
}
