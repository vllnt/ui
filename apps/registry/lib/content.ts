import { readFile } from "node:fs/promises";
import path from "node:path";

import matter from "gray-matter";

import { type PageFrontmatter, pageFrontmatterSchema } from "./schemas";

type PageContent = {
  content: string;
  frontmatter: PageFrontmatter;
};

const CONTENT_DIR = path.join(process.cwd(), "content", "pages");

export async function getPageContent(slug: string): Promise<PageContent> {
  const filePath = path.join(CONTENT_DIR, `${slug}.mdx`);
  const raw = await readFile(filePath, "utf8");
  const { content, data } = matter(raw);
  const frontmatter = pageFrontmatterSchema.parse(data);

  return { content, frontmatter };
}
