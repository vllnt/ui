import type { Metadata } from "next";

import type { Locale } from "@/i18n/locales";
import { articleFeedPath } from "@/lib/article-feed";
import {
  type Article,
  articleHeading,
  articlePath,
  articleUrl,
} from "@/lib/articles";
import {
  articleLd,
  breadcrumbTrailLd,
  collectionPageLd,
  type JsonLdNode,
} from "@/lib/jsonld";
import { generateOGImageURL, pageMetadata } from "@/lib/og";
import { absoluteUrl, canonical, languageAlternates } from "@/lib/seo";

type IndexCopy = {
  readonly description: string;
  readonly title: string;
};

function feedAlternates(locale: Locale): Record<string, string> {
  return {
    "application/atom+xml": absoluteUrl(articleFeedPath(locale, "atom")),
    "application/rss+xml": absoluteUrl(articleFeedPath(locale, "rss")),
  };
}

/**
 * The social image of an article: its hosted `image`, or the generated
 * `/api/og` card of its title.
 *
 * @param article - the article
 * @returns Absolute image URL
 */
export function articleSocialImage(article: Article): string {
  const { description, image, title } = article.frontmatter;

  return absoluteUrl(
    image?.src ?? generateOGImageURL({ description, title, type: "page" }),
  );
}

/**
 * Metadata of an article page. The title appears as written, because it
 * already ends with the site name. The canonical points to the page's own URL
 * in its own locale, and hreflang lists the locales that have the article.
 *
 * @param article - the article
 * @param availableLocales - locales that serve this article
 * @returns Next.js metadata
 */
export function articleMetadata(
  article: Article,
  availableLocales: readonly Locale[],
): Metadata {
  const { description, image, tags, title } = article.frontmatter;
  const pathname = articlePath(article.slug);

  return pageMetadata({
    alternates: {
      languages: languageAlternates(pathname, availableLocales),
      types: feedAlternates(article.locale),
    },
    description,
    image,
    keywords: tags.map((tag) => tag.replaceAll("-", " ")),
    locale: article.locale,
    og: { description, title, type: "page" },
    pathname,
  });
}

/**
 * Metadata of the `/articles` index.
 *
 * @param locale - locale of the page
 * @param copy - localized title and description
 * @returns Next.js metadata
 */
export function articlesIndexMetadata(
  locale: Locale,
  copy: IndexCopy,
): Metadata {
  return pageMetadata({
    alternates: { types: feedAlternates(locale) },
    locale,
    og: { description: copy.description, title: copy.title, type: "page" },
    pathname: "/articles",
  });
}

/**
 * JSON-LD of an article page: the `Article` and its `BreadcrumbList`.
 *
 * @param input - the article and the localized names of the first two crumbs
 * @returns JSON-LD nodes
 */
export function articleStructuredData(input: {
  readonly article: Article;
  readonly articlesName: string;
  readonly homeName: string;
}): readonly JsonLdNode[] {
  const { article, articlesName, homeName } = input;
  const { date, description, tags, updated } = article.frontmatter;
  const heading = articleHeading(article);

  return [
    articleLd({
      dateModified: updated,
      datePublished: date,
      description,
      image: articleSocialImage(article),
      inLanguage: article.locale,
      keywords: tags,
      title: heading,
      url: articleUrl(article),
    }),
    breadcrumbTrailLd(
      article.locale,
      [
        { name: articlesName, path: "/articles" },
        { name: heading, path: articlePath(article.slug) },
      ],
      homeName,
    ),
  ];
}

/**
 * JSON-LD of the `/articles` index: its `BreadcrumbList`, and a `CollectionPage`
 * once there is an article to list.
 *
 * @param input - locale, localized copy and names, and the locale's articles
 * @returns JSON-LD nodes
 */
export function articlesIndexStructuredData(input: {
  readonly articles: readonly Article[];
  readonly copy: IndexCopy;
  readonly homeName: string;
  readonly locale: Locale;
}): readonly JsonLdNode[] {
  const { articles, copy, homeName, locale } = input;
  const breadcrumb = breadcrumbTrailLd(
    locale,
    [{ name: copy.title, path: "/articles" }],
    homeName,
  );

  if (articles.length === 0) return [breadcrumb];

  return [
    breadcrumb,
    collectionPageLd({
      description: copy.description,
      items: articles.map((article) => ({
        name: articleHeading(article),
        url: articleUrl(article),
      })),
      title: copy.title,
      url: canonical("/articles", locale),
    }),
  ];
}
