import { fileURLToPath } from "node:url";

import { beforeAll, describe, expect, it } from "vitest";

import {
  articleMetadata,
  articlesIndexMetadata,
  articlesIndexStructuredData,
  articleSocialImage,
  articleStructuredData,
} from "./article-seo";
import { type Article, getArticle, getArticles } from "./articles";

const FIXTURES = fileURLToPath(
  new URL("../test/fixtures/articles", import.meta.url),
);
const SITE = "https://ui.vllnt.com";

let withImage: Article;
let withImageFr: Article;
let withoutImage: Article;

async function fixture(slug: string, locale: "en" | "fr"): Promise<Article> {
  const article = await getArticle(slug, locale, FIXTURES);
  if (!article) throw new Error(`missing fixture ${slug}/${locale}`);

  return article;
}

beforeAll(async () => {
  withImage = await fixture("fixture-article", "en");
  withImageFr = await fixture("fixture-article", "fr");
  withoutImage = await fixture("fixture-older", "en");
});

describe("articleMetadata", () => {
  it("uses the title as written, so the site name appears once", () => {
    const metadata = articleMetadata(withImage, ["en", "fr"]);

    expect(metadata.title).toBe("Fixture article on glass surfaces | vllnt UI");
    expect(String(metadata.title).match(/vllnt UI/g)).toHaveLength(1);
    expect(metadata.openGraph).toMatchObject({
      title: "Fixture article on glass surfaces | vllnt UI",
    });
    expect(metadata.twitter).toMatchObject({
      title: "Fixture article on glass surfaces | vllnt UI",
    });
  });

  it("is canonical to its own URL in its own locale", () => {
    expect(articleMetadata(withImage, ["en", "fr"]).alternates?.canonical).toBe(
      `${SITE}/articles/fixture-article`,
    );
    expect(
      articleMetadata(withImageFr, ["en", "fr"]).alternates?.canonical,
    ).toBe(`${SITE}/fr/articles/fixture-article`);
  });

  it("declares en, fr and x-default for an article in both locales", () => {
    const expected = {
      en: `${SITE}/articles/fixture-article`,
      fr: `${SITE}/fr/articles/fixture-article`,
      "x-default": `${SITE}/articles/fixture-article`,
    };

    expect(articleMetadata(withImage, ["en", "fr"]).alternates?.languages).toEqual(
      expected,
    );
    expect(
      articleMetadata(withImageFr, ["en", "fr"]).alternates?.languages,
    ).toEqual(expected);
  });

  it("declares only the locales that have the article", () => {
    expect(articleMetadata(withImage, ["en"]).alternates?.languages).toEqual({
      en: `${SITE}/articles/fixture-article`,
      "x-default": `${SITE}/articles/fixture-article`,
    });
    expect(
      articleMetadata(withImageFr, ["fr"]).alternates?.languages,
    ).toEqual({
      fr: `${SITE}/fr/articles/fixture-article`,
      "x-default": `${SITE}/fr/articles/fixture-article`,
    });
  });

  it("uses the hosted image for Open Graph and Twitter when the article has one", () => {
    const metadata = articleMetadata(withImage, ["en", "fr"]);
    const hosted = [
      {
        alt: "A fixture card showing a frosted panel",
        url: `${SITE}/fixture-article-card.png`,
      },
    ];

    expect(metadata.openGraph).toMatchObject({ images: hosted });
    expect(metadata.twitter).toMatchObject({ images: hosted });
    expect(articleSocialImage(withImage)).toBe(
      `${SITE}/fixture-article-card.png`,
    );
  });

  it("uses the generated /api/og card when the article has no image", () => {
    const metadata = articleMetadata(withoutImage, ["en", "fr"]);
    const twitterImages =
      metadata.twitter && "images" in metadata.twitter
        ? metadata.twitter.images
        : undefined;
    const openGraphImages =
      metadata.openGraph && "images" in metadata.openGraph
        ? JSON.stringify(metadata.openGraph.images)
        : "";

    expect(twitterImages).toEqual([expect.stringContaining("/api/og?")]);
    expect(openGraphImages).toContain("/api/og?");
    expect(articleSocialImage(withoutImage)).toMatch(
      /^https:\/\/ui\.vllnt\.com\/api\/og\?.*title=Fixture\+older\+article/,
    );
  });

  it("advertises the feeds of its own locale", () => {
    expect(articleMetadata(withImage, ["en", "fr"]).alternates?.types).toEqual({
      "application/atom+xml": `${SITE}/articles/en/atom.xml`,
      "application/rss+xml": `${SITE}/articles/en/rss.xml`,
    });
    expect(
      articleMetadata(withImageFr, ["en", "fr"]).alternates?.types,
    ).toEqual({
      "application/atom+xml": `${SITE}/articles/fr/atom.xml`,
      "application/rss+xml": `${SITE}/articles/fr/rss.xml`,
    });
  });

  it("keeps the article indexable and turns tags into keywords", () => {
    const metadata = articleMetadata(withImage, ["en", "fr"]);

    expect(metadata.robots).toBeUndefined();
    expect(metadata.keywords).toEqual(["fixtures", "glass surfaces"]);
    expect(metadata.description).toBe(withImage.frontmatter.description);
  });
});

describe("articlesIndexMetadata", () => {
  const copy = { description: "Index description.", title: "Index title" };

  it("is canonical per locale and uses the title as written", () => {
    const english = articlesIndexMetadata("en", copy);
    const french = articlesIndexMetadata("fr", copy);

    expect(english.title).toBe("Index title");
    expect(english.alternates?.canonical).toBe(`${SITE}/articles`);
    expect(french.alternates?.canonical).toBe(`${SITE}/fr/articles`);
    expect(french.alternates?.languages).toEqual({
      en: `${SITE}/articles`,
      fr: `${SITE}/fr/articles`,
      "x-default": `${SITE}/articles`,
    });
  });

  it("advertises the feeds of its locale", () => {
    expect(articlesIndexMetadata("fr", copy).alternates?.types).toEqual({
      "application/atom+xml": `${SITE}/articles/fr/atom.xml`,
      "application/rss+xml": `${SITE}/articles/fr/rss.xml`,
    });
  });
});

describe("articleStructuredData", () => {
  it("returns an Article and a BreadcrumbList that name the page", () => {
    const [article, breadcrumb] = articleStructuredData({
      article: withImage,
      articlesName: "Articles",
      homeName: "Home",
    });

    expect(article).toMatchObject({
      "@type": "Article",
      dateModified: "2026-11-02",
      datePublished: "2026-10-05",
      headline: "Glass surfaces in a fixture",
      image: `${SITE}/fixture-article-card.png`,
      inLanguage: "en",
      url: `${SITE}/articles/fixture-article`,
    });
    expect(breadcrumb).toMatchObject({
      "@type": "BreadcrumbList",
      itemListElement: [
        { item: SITE, name: "Home", position: 1 },
        { item: `${SITE}/articles`, name: "Articles", position: 2 },
        {
          item: `${SITE}/articles/fixture-article`,
          name: "Glass surfaces in a fixture",
          position: 3,
        },
      ],
      name: "Glass surfaces in a fixture",
    });
  });

  it("carries the locale prefix and the localized names in French", () => {
    const [article, breadcrumb] = articleStructuredData({
      article: withImageFr,
      articlesName: "Articles",
      homeName: "Accueil",
    });

    expect(article).toMatchObject({
      inLanguage: "fr",
      url: `${SITE}/fr/articles/fixture-article`,
    });
    expect(breadcrumb).toMatchObject({
      itemListElement: [
        { item: `${SITE}/fr`, name: "Accueil", position: 1 },
        { item: `${SITE}/fr/articles`, name: "Articles", position: 2 },
        {
          item: `${SITE}/fr/articles/fixture-article`,
          name: "Surfaces en verre dans un test",
          position: 3,
        },
      ],
    });
  });

  it("falls back to the image generated from the title", () => {
    const [article] = articleStructuredData({
      article: withoutImage,
      articlesName: "Articles",
      homeName: "Home",
    });

    expect(article?.image).toMatch(/^https:\/\/ui\.vllnt\.com\/api\/og\?/);
  });
});

describe("articlesIndexStructuredData", () => {
  const copy = { description: "Index description.", title: "Articles" };

  it("is a named BreadcrumbList alone while there is no article", () => {
    const nodes = articlesIndexStructuredData({
      articles: [],
      copy,
      homeName: "Home",
      locale: "en",
    });

    expect(nodes).toHaveLength(1);
    expect(nodes[0]).toMatchObject({
      "@type": "BreadcrumbList",
      itemListElement: [
        { item: SITE, name: "Home", position: 1 },
        { item: `${SITE}/articles`, name: "Articles", position: 2 },
      ],
      name: "Articles",
    });
  });

  it("adds a CollectionPage that lists the articles in order", async () => {
    const articles = await getArticles("fr", FIXTURES);
    const nodes = articlesIndexStructuredData({
      articles,
      copy,
      homeName: "Accueil",
      locale: "fr",
    });

    expect(nodes).toHaveLength(2);
    expect(nodes[1]).toMatchObject({
      "@type": "CollectionPage",
      mainEntity: {
        itemListElement: [
          {
            name: "Surfaces en verre dans un test",
            position: 1,
            url: `${SITE}/fr/articles/fixture-article`,
          },
          {
            name: "Un ancien article de test",
            position: 2,
            url: `${SITE}/fr/articles/fixture-older`,
          },
        ],
        numberOfItems: 2,
      },
      url: `${SITE}/fr/articles`,
    });
  });
});
