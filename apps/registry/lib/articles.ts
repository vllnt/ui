import type { Dirent } from "node:fs";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

import matter from "gray-matter";
import { z } from "zod";

import { type Locale, locales } from "@/i18n/locales";
import {
  leadingMarkdownHeading,
  stripLeadingMarkdownHeading,
} from "@/lib/markdown";
import { registry } from "@/lib/registry";
import { canonical } from "@/lib/seo";

const KEBAB_CASE = /^[\da-z]+(?:-[\da-z]+)*$/;
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const SITE_SUFFIX = /\s*\|\s*vllnt ui\s*$/i;
const REGISTRY_NAMES: ReadonlySet<string> = new Set(
  registry.items.map((item) => item.name),
);

function isCalendarDate(value: string): boolean {
  const parsed = new Date(`${value}T00:00:00.000Z`);

  return (
    !Number.isNaN(parsed.getTime()) && parsed.toISOString().startsWith(value)
  );
}

/**
 * YAML turns an unquoted `2026-11-20` into a `Date`, so the schema accepts that
 * and a quoted string alike and keeps the `YYYY-MM-DD` form.
 */
const isoDateSchema = z.preprocess(
  (value) => (value instanceof Date ? value.toISOString().slice(0, 10) : value),
  z
    .string()
    .regex(ISO_DATE, "must be an ISO date such as 2026-11-20")
    .refine(isCalendarDate, "is not a real calendar date"),
);

const sitePathOrHttpsUrl = (value: string): boolean =>
  value.startsWith("/") || value.startsWith("https://");

/**
 * Frontmatter of `content/articles/<slug>/<locale>.mdx`. Strict: an unknown key
 * is a typo that would otherwise vanish without a trace.
 */
export const articleFrontmatterSchema = z
  .strictObject({
    components: z.array(z.string().min(1)).optional(),
    date: isoDateSchema,
    description: z.string().trim().min(1),
    draft: z.boolean().default(false),
    image: z
      .strictObject({
        alt: z.string().trim().min(1),
        src: z
          .string()
          .refine(
            sitePathOrHttpsUrl,
            "must be a site path starting with / or an https URL",
          ),
      })
      .optional(),
    status: z.enum(["shipped", "roadmap", "mixed"]),
    tags: z.array(
      z.string().regex(KEBAB_CASE, "tags must be kebab-case strings"),
    ),
    title: z.string().trim().min(1),
    updated: isoDateSchema.optional(),
  })
  .refine(
    (value) => value.updated === undefined || value.updated >= value.date,
    {
      error: "updated must not be before date",
      path: ["updated"],
    },
  )
  .transform((value) => ({ ...value, updated: value.updated ?? value.date }));

export type ArticleFrontmatter = z.output<typeof articleFrontmatterSchema>;

export type ArticleStatus = ArticleFrontmatter["status"];

export type Article = {
  readonly content: string;
  readonly frontmatter: ArticleFrontmatter;
  readonly locale: Locale;
  readonly slug: string;
};

function describeIssues(error: z.ZodError): string {
  return error.issues
    .map((issue) => {
      const field = issue.path.map(String).join(".");
      return `${field || "frontmatter"}: ${issue.message}`;
    })
    .join("; ");
}

/**
 * Parses and validates one article file. Invalid frontmatter, or a `components`
 * name that is not in the registry, throws an error that names the file and the
 * field.
 *
 * @param raw - file text: YAML frontmatter, then the markdown body
 * @param source - the slug and locale the file lives under
 * @returns The article
 * @example
 * parseArticleSource(text, { locale: "en", slug: "liquid-glass-in-react" });
 */
export function parseArticleSource(
  raw: string,
  source: { readonly locale: Locale; readonly slug: string },
): Article {
  const label = `content/articles/${source.slug}/${source.locale}.mdx`;
  const { content, data } = matter(raw);
  const result = articleFrontmatterSchema.safeParse(data);

  if (!result.success) {
    throw new Error(
      `Invalid article frontmatter in ${label}: ${describeIssues(result.error)}`,
    );
  }

  const unknown = (result.data.components ?? []).filter(
    (name) => !REGISTRY_NAMES.has(name),
  );
  if (unknown.length > 0) {
    throw new Error(
      `Invalid article frontmatter in ${label}: components: unknown registry name(s) ${unknown.join(", ")}`,
    );
  }

  return {
    content,
    frontmatter: result.data,
    locale: source.locale,
    slug: source.slug,
  };
}

function isMissingEntry(error: unknown): boolean {
  return error instanceof Error && "code" in error && error.code === "ENOENT";
}

async function listDirectory(directory: string): Promise<Dirent[]> {
  try {
    return await readdir(directory, { withFileTypes: true });
  } catch (error) {
    if (isMissingEntry(error)) return [];
    throw error;
  }
}

function localeOfFile(slug: string, fileName: string): Locale {
  const base = fileName.slice(0, -".mdx".length);
  const locale = locales.find((entry) => entry === base);

  if (!locale) {
    throw new Error(
      `Unknown locale file content/articles/${slug}/${fileName}: use ${locales.map((entry) => `${entry}.mdx`).join(" or ")}`,
    );
  }

  return locale;
}

async function readArticleDirectory(
  directory: string,
  slug: string,
): Promise<readonly Article[]> {
  if (!KEBAB_CASE.test(slug)) {
    throw new Error(
      `Invalid article slug "${slug}": use kebab-case, content/articles/<kebab-slug>/<locale>.mdx`,
    );
  }

  const entries = await listDirectory(path.join(directory, slug));
  const files = entries.filter(
    (entry) => entry.isFile() && entry.name.endsWith(".mdx"),
  );

  return Promise.all(
    files.map(async (file) => {
      const locale = localeOfFile(slug, file.name);
      const raw = await readFile(path.join(directory, slug, file.name), "utf8");

      return parseArticleSource(raw, { locale, slug });
    }),
  );
}

async function readCatalog(directory: string): Promise<readonly Article[]> {
  const entries = await listDirectory(directory);
  const slugs = entries
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();
  const groups = await Promise.all(
    slugs.map((slug) => readArticleDirectory(directory, slug)),
  );

  return groups.flat();
}

/**
 * Where the articles live: `content/articles`, or the directory named by
 * `ARTICLES_DIR` (tests and previews point it at fixtures).
 *
 * @returns Absolute directory path
 */
export function articlesDirectory(): string {
  const override = process.env.ARTICLES_DIR;

  return override
    ? path.resolve(process.cwd(), override)
    : path.join(process.cwd(), "content", "articles");
}

const catalogCache = new Map<string, Promise<readonly Article[]>>();

/**
 * Every article file, drafts included, validated. A missing directory is an
 * empty collection. A production build reads each file once; `next dev` and
 * tests read on every call so an edit shows up.
 *
 * @param directory - articles directory; {@link articlesDirectory} by default
 * @returns Articles in file order
 */
export function getAllArticles(
  directory: string = articlesDirectory(),
): Promise<readonly Article[]> {
  if (process.env.NODE_ENV !== "production") return readCatalog(directory);

  const cached = catalogCache.get(directory);
  if (cached) return cached;

  const pending = readCatalog(directory);
  catalogCache.set(directory, pending);

  return pending;
}

function newestFirst(a: Article, b: Article): number {
  return (
    b.frontmatter.date.localeCompare(a.frontmatter.date) ||
    a.slug.localeCompare(b.slug) ||
    locales.indexOf(a.locale) - locales.indexOf(b.locale)
  );
}

/**
 * The articles every public surface may list, in every locale, newest first.
 *
 * A draft (`draft: true`) does not count as published: this list leaves it
 * out, so the index, the sitemap, the feeds and `llms.txt` leave it out too,
 * and it gets no page. Its URL answers 404 in every environment, because the
 * article routes generate the articles this function returns and refuse any
 * other slug.
 *
 * @param directory - articles directory; {@link articlesDirectory} by default
 * @returns Published articles
 */
export async function getPublishedArticles(
  directory?: string,
): Promise<readonly Article[]> {
  const all = await getAllArticles(directory);

  return all.filter((article) => !article.frontmatter.draft).sort(newestFirst);
}

/**
 * The published articles of one locale, newest first.
 *
 * @param locale - locale to list
 * @param directory - articles directory; {@link articlesDirectory} by default
 * @returns Published articles in that locale
 * @example
 * const [latest] = await getArticles("en");
 */
export async function getArticles(
  locale: Locale,
  directory?: string,
): Promise<readonly Article[]> {
  const published = await getPublishedArticles(directory);

  return published.filter((article) => article.locale === locale);
}

/**
 * One published article, or `undefined` for a draft, an unknown slug or a
 * locale the article has no file for.
 *
 * @param slug - article folder name
 * @param locale - locale of the file
 * @param directory - articles directory; {@link articlesDirectory} by default
 * @returns The article
 */
export async function getArticle(
  slug: string,
  locale: Locale,
  directory?: string,
): Promise<Article | undefined> {
  const articles = await getArticles(locale, directory);

  return articles.find((article) => article.slug === slug);
}

/**
 * The locales a published article exists in, in `locales` order.
 *
 * @param articles - published articles, every locale
 * @param slug - article folder name
 * @returns Locales that serve the article
 */
export function articleLocales(
  articles: readonly Article[],
  slug: string,
): readonly Locale[] {
  return locales.filter((locale) =>
    articles.some(
      (article) => article.slug === slug && article.locale === locale,
    ),
  );
}

/**
 * Coverage rule for `i18n:check`: a published article exists in every locale
 * (a draft file counts as present), so no locale falls back to another. An
 * article whose files are all drafts is exempt.
 *
 * @param articles - every article file, drafts included
 * @returns One message per missing file
 */
export function findArticleCoverageIssues(
  articles: readonly Article[],
): readonly string[] {
  const published = new Set(
    articles
      .filter((article) => !article.frontmatter.draft)
      .map((article) => article.slug),
  );

  return [...published].sort().flatMap((slug) => {
    const present = articles
      .filter((article) => article.slug === slug)
      .map((article) => article.locale);
    const presentLocales = new Set<string>(present);

    return locales
      .filter((locale) => !presentLocales.has(locale))
      .map(
        (locale) =>
          `article "${slug}" is missing ${locale}.mdx (present: ${present.join(", ")})`,
      );
  });
}

/**
 * Locale-relative path of an article page.
 *
 * @param slug - article folder name
 * @returns `/articles/<slug>`
 */
export function articlePath(slug: string): string {
  return `/articles/${slug}`;
}

/**
 * The canonical URL of an article in its own locale.
 *
 * @param article - the article
 * @returns Absolute URL
 */
export function articleUrl(article: Article): string {
  return canonical(articlePath(article.slug), article.locale);
}

/**
 * The page heading: the body's leading `#` heading when it has one, otherwise
 * the title without the ` | VLLNT UI` site suffix.
 *
 * @param article - the article
 * @returns The heading text
 */
export function articleHeading(article: Article): string {
  return (
    leadingMarkdownHeading(article.content) ??
    article.frontmatter.title.replace(SITE_SUFFIX, "")
  );
}

/**
 * The body without its leading heading, which the page renders as its `h1`.
 *
 * @param article - the article
 * @returns Markdown
 */
export function articleBody(article: Article): string {
  return stripLeadingMarkdownHeading(article.content);
}
