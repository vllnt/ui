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

async function readLocalizedPage(slug: string, locale: Locale) {
  const filePath = path.join(CONTENT_DIR, slug, `${locale}.mdx`);
  const raw = await readFile(filePath, "utf8");

  return { locale, raw };
}

export async function getPageContent(
  slug: string,
  locale: Locale = routing.defaultLocale,
): Promise<PageContent> {
  let resolved;

  try {
    resolved = await readLocalizedPage(slug, locale);
  } catch (error) {
    if (locale === routing.defaultLocale) {
      throw error;
    }

    resolved = await readLocalizedPage(slug, routing.defaultLocale);
  }

  const { content, data } = matter(resolved.raw);
  const frontmatter = pageFrontmatterSchema.parse(data);

  return { content, frontmatter, locale: resolved.locale };
}
