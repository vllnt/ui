import { readdir } from "node:fs/promises";
import path from "node:path";

import { type Locale, routing } from "@/i18n/routing";
import { getPageContent } from "@/lib/content";

const GUIDES_DIR = path.join(process.cwd(), "content", "pages", "guides");

/** Complete, locale-paired directories become public guide routes. */
export async function getGuideSlugs(): Promise<string[]> {
  const entries = await readdir(GUIDES_DIR, { withFileTypes: true });
  const candidates = entries.filter(
    (entry) =>
      entry.isDirectory() && /^[\da-z]+(?:-[\da-z]+)*$/.test(entry.name),
  );
  const slugs = await Promise.all(
    candidates.map(async (entry) => {
      const files = await readdir(path.join(GUIDES_DIR, entry.name), {
        withFileTypes: true,
      });
      return routing.locales.every((locale) =>
        files.some((file) => file.isFile() && file.name === `${locale}.mdx`),
      )
        ? entry.name
        : undefined;
    }),
  );
  return slugs.filter((slug) => slug !== undefined).sort();
}

/** Check the discovered allowlist before passing any slug to the file loader. */
export async function getGuideContent(slug: string, locale: Locale) {
  const slugs = await getGuideSlugs();
  if (!slugs.includes(slug)) return;
  return getPageContent(`guides/${slug}`, locale);
}

export async function getGuides(locale: Locale) {
  const slugs = await getGuideSlugs();
  return Promise.all(slugs.map(async (slug) => {
    const { frontmatter } = await getPageContent(`guides/${slug}`, locale);
    return { slug, ...frontmatter };
  }));
}
