import type { Locale } from "@/i18n/locales";
import { type Article, articleUrl } from "@/lib/articles";
import { escapeXml } from "@/lib/feed";
import { absoluteUrl, canonical, ogLocale } from "@/lib/seo";

export type ArticleFeedFormat = "atom" | "rss";

type ArticleFeedChannel = {
  /** Feed date when the collection has no article yet. */
  readonly buildDate: Date;
  readonly description: string;
  readonly title: string;
};

const FILE_NAMES: Record<ArticleFeedFormat, string> = {
  atom: "atom.xml",
  rss: "rss.xml",
};

/**
 * Path of the articles feed of one locale. One feed per locale keeps each
 * reader on one language, and the dotted file name keeps the path outside the
 * locale middleware, which would otherwise rewrite an unprefixed one.
 *
 * @param locale - locale of the feed
 * @param format - `rss` or `atom`
 * @returns `/articles/<locale>/rss.xml` or `/articles/<locale>/atom.xml`
 */
export function articleFeedPath(
  locale: Locale,
  format: ArticleFeedFormat,
): string {
  return `/articles/${locale}/${FILE_NAMES[format]}`;
}

/**
 * Absolute URL of an articles feed.
 *
 * @param locale - locale of the feed
 * @param format - `rss` or `atom`
 * @returns Absolute URL
 */
export function articleFeedUrl(
  locale: Locale,
  format: ArticleFeedFormat,
): string {
  return absoluteUrl(articleFeedPath(locale, format));
}

function midnightUtc(date: string): Date {
  return new Date(`${date}T00:00:00.000Z`);
}

function latestUpdate(articles: readonly Article[], buildDate: Date): Date {
  const [latest] = articles
    .map((article) => article.frontmatter.updated)
    .sort()
    .reverse();

  return latest ? midnightUtc(latest) : buildDate;
}

function rssItem(article: Article): string {
  const url = articleUrl(article);

  return [
    "    <item>",
    `      <title>${escapeXml(article.frontmatter.title)}</title>`,
    `      <link>${escapeXml(url)}</link>`,
    `      <guid isPermaLink="true">${escapeXml(url)}</guid>`,
    `      <pubDate>${midnightUtc(article.frontmatter.date).toUTCString()}</pubDate>`,
    `      <description>${escapeXml(article.frontmatter.description)}</description>`,
    ...article.frontmatter.tags.map(
      (tag) => `      <category>${escapeXml(tag)}</category>`,
    ),
    "    </item>",
  ].join("\n");
}

function atomEntry(article: Article): string {
  const url = articleUrl(article);

  return [
    "  <entry>",
    `    <title>${escapeXml(article.frontmatter.title)}</title>`,
    `    <id>${escapeXml(url)}</id>`,
    `    <link href="${escapeXml(url)}" />`,
    `    <published>${midnightUtc(article.frontmatter.date).toISOString()}</published>`,
    `    <updated>${midnightUtc(article.frontmatter.updated).toISOString()}</updated>`,
    `    <summary>${escapeXml(article.frontmatter.description)}</summary>`,
    ...article.frontmatter.tags.map(
      (tag) => `    <category term="${escapeXml(tag)}" />`,
    ),
    "  </entry>",
  ].join("\n");
}

/**
 * The RSS 2.0 feed of one locale's published articles.
 *
 * @param locale - locale of the feed
 * @param articles - published articles of that locale, newest first
 * @param channel - feed title, description and the date of an empty feed
 * @returns RSS XML
 */
export function buildArticlesRss(
  locale: Locale,
  articles: readonly Article[],
  channel: ArticleFeedChannel,
): string {
  const updated = latestUpdate(articles, channel.buildDate);

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">',
    "  <channel>",
    `    <title>${escapeXml(channel.title)}</title>`,
    `    <link>${escapeXml(canonical("/articles", locale))}</link>`,
    `    <description>${escapeXml(channel.description)}</description>`,
    `    <language>${ogLocale(locale).replace("_", "-")}</language>`,
    `    <lastBuildDate>${updated.toUTCString()}</lastBuildDate>`,
    `    <atom:link href="${escapeXml(articleFeedUrl(locale, "rss"))}" rel="self" type="application/rss+xml" />`,
    ...articles.map(rssItem),
    "  </channel>",
    "</rss>",
  ].join("\n");
}

/**
 * The Atom feed of one locale's published articles.
 *
 * @param locale - locale of the feed
 * @param articles - published articles of that locale, newest first
 * @param channel - feed title, description and the date of an empty feed
 * @returns Atom XML
 */
export function buildArticlesAtom(
  locale: Locale,
  articles: readonly Article[],
  channel: ArticleFeedChannel,
): string {
  const updated = latestUpdate(articles, channel.buildDate);
  const index = canonical("/articles", locale);

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    `<feed xmlns="http://www.w3.org/2005/Atom" xml:lang="${locale}">`,
    `  <title>${escapeXml(channel.title)}</title>`,
    `  <subtitle>${escapeXml(channel.description)}</subtitle>`,
    `  <id>${escapeXml(index)}</id>`,
    `  <link href="${escapeXml(index)}" />`,
    `  <link rel="self" href="${escapeXml(articleFeedUrl(locale, "atom"))}" />`,
    "  <author><name>vllnt</name></author>",
    `  <updated>${updated.toISOString()}</updated>`,
    ...articles.map(atomEntry),
    "</feed>",
  ].join("\n");
}
