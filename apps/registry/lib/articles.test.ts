import path from "node:path";
import { fileURLToPath } from "node:url";

import { afterEach, describe, expect, it, vi } from "vitest";

import {
  type Article,
  articleBody,
  articleHeading,
  articleLocales,
  articlePath,
  articlesDirectory,
  articleUrl,
  findArticleCoverageIssues,
  getAllArticles,
  getArticle,
  getArticles,
  getPublishedArticles,
  parseArticleSource,
} from "./articles";

const FIXTURES = fileURLToPath(
  new URL("../test/fixtures/articles", import.meta.url),
);

function invalidFixtures(name: string): string {
  return fileURLToPath(
    new URL(`../test/fixtures/articles-invalid/${name}`, import.meta.url),
  );
}

const BASE: Record<string, unknown> = {
  date: "2026-10-05",
  description: "A description.",
  status: "shipped",
  tags: ["fixtures"],
  title: "A title | vllnt UI",
};

function without(key: string): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(BASE).filter(([entry]) => entry !== key),
  );
}

function source(data: Record<string, unknown>, body = "# Heading\n\nBody.\n") {
  return `---\n${JSON.stringify(data)}\n---\n${body}`;
}

function parse(
  data: Record<string, unknown>,
  body?: string,
  locale: "en" | "fr" = "en",
): Article {
  return parseArticleSource(source(data, body), { locale, slug: "a-slug" });
}

function ids(articles: readonly Article[]): string[] {
  return articles.map((article) => `${article.slug}/${article.locale}`);
}

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("parseArticleSource", () => {
  it("keeps a valid file and defaults draft to false and updated to date", () => {
    const article = parse(BASE);

    expect(article.frontmatter).toEqual({
      date: "2026-10-05",
      description: "A description.",
      draft: false,
      status: "shipped",
      tags: ["fixtures"],
      title: "A title | vllnt UI",
      updated: "2026-10-05",
    });
    expect(article).toMatchObject({ locale: "en", slug: "a-slug" });
    expect(article.content).toContain("Body.");
  });

  it("keeps an explicit updated date and the draft flag", () => {
    const article = parse({ ...BASE, draft: true, updated: "2026-11-02" });

    expect(article.frontmatter.updated).toBe("2026-11-02");
    expect(article.frontmatter.draft).toBe(true);
  });

  it("accepts an unquoted YAML date, which YAML reads as a Date", () => {
    const text = [
      "---",
      "title: A title",
      "description: A description.",
      "date: 2026-10-05",
      "updated: 2026-11-02",
      "tags: []",
      "status: roadmap",
      "---",
      "Body",
    ].join("\n");
    const article = parseArticleSource(text, { locale: "fr", slug: "a-slug" });

    expect(article.frontmatter.date).toBe("2026-10-05");
    expect(article.frontmatter.updated).toBe("2026-11-02");
    expect(article.locale).toBe("fr");
  });

  it.each(["shipped", "roadmap", "mixed"])("accepts status %s", (status) => {
    expect(parse({ ...BASE, status }).frontmatter.status).toBe(status);
  });

  it("accepts registry component names", () => {
    expect(
      parse({ ...BASE, components: ["button"] }).frontmatter.components,
    ).toEqual(["button"]);
  });

  it.each(["/card.png", "https://example.com/card.png"])(
    "accepts the image source %s",
    (source_) => {
      expect(
        parse({ ...BASE, image: { alt: "A card", src: source_ } }).frontmatter
          .image,
      ).toEqual({ alt: "A card", src: source_ });
    },
  );

  it("prefixes every failure with the file", () => {
    expect(() => parse(without("title"))).toThrow(
      /^Invalid article frontmatter in content\/articles\/a-slug\/en\.mdx: /,
    );
  });

  it.each([
    { data: without("title"), label: "a missing title", pattern: /title:/ },
    {
      data: { ...BASE, title: "   " },
      label: "a blank title",
      pattern: /title:/,
    },
    {
      data: without("description"),
      label: "a missing description",
      pattern: /description:/,
    },
    { data: without("date"), label: "a missing date", pattern: /date:/ },
    {
      data: { ...BASE, date: "05/10/2026" },
      label: "a date that is not ISO",
      pattern: /date: must be an ISO date/,
    },
    {
      data: { ...BASE, date: "2026-02-30" },
      label: "a date that is not on the calendar",
      pattern: /date: is not a real calendar date/,
    },
    {
      data: { ...BASE, updated: "2026-10-04" },
      label: "an updated date before the date",
      pattern: /updated: updated must not be before date/,
    },
    {
      data: { ...BASE, updated: "yesterday" },
      label: "an updated date that is not ISO",
      pattern: /updated: must be an ISO date/,
    },
    {
      data: { ...BASE, tags: ["Not Kebab"] },
      label: "a tag that is not kebab-case",
      pattern: /tags\.0: tags must be kebab-case strings/,
    },
    {
      data: { ...BASE, tags: "fixtures" },
      label: "tags that are not a list",
      pattern: /tags:/,
    },
    { data: without("tags"), label: "missing tags", pattern: /tags:/ },
    {
      data: { ...BASE, status: "published" },
      label: "an unknown status",
      pattern: /status:/,
    },
    { data: without("status"), label: "a missing status", pattern: /status:/ },
    {
      data: { ...BASE, image: { src: "/card.png" } },
      label: "an image without alt",
      pattern: /image\.alt:/,
    },
    {
      data: { ...BASE, image: { alt: "  ", src: "/card.png" } },
      label: "an image with a blank alt",
      pattern: /image\.alt:/,
    },
    {
      data: { ...BASE, image: { alt: "A card", src: "card.png" } },
      label: "an image source that is not a site path or https URL",
      pattern: /image\.src: must be a site path/,
    },
    {
      data: { ...BASE, titel: "typo" },
      label: "an unknown key",
      pattern: /Unrecognized key.*titel/,
    },
    {
      data: { ...BASE, draft: "yes" },
      label: "a draft flag that is not a boolean",
      pattern: /draft:/,
    },
    {
      data: { ...BASE, components: ["button", "not-a-component"] },
      label: "an unknown component name",
      pattern: /components: unknown registry name\(s\) not-a-component/,
    },
  ])("rejects $label", ({ data, pattern }) => {
    expect(() => parse(data)).toThrow(pattern);
  });
});

describe("article text helpers", () => {
  it("uses the leading heading of the body as the page heading", () => {
    const article = parse(BASE, "# Own heading\n\nText\n");

    expect(articleHeading(article)).toBe("Own heading");
    expect(articleBody(article)).toBe("Text\n");
  });

  it("falls back to the title without the site suffix", () => {
    const article = parse(BASE, "Text only\n");

    expect(articleHeading(article)).toBe("A title");
    expect(articleBody(article)).toBe("Text only\n");
  });

  it("keeps a title that has no site suffix", () => {
    const article = parse({ ...BASE, title: "Plain title" }, "Text\n");

    expect(articleHeading(article)).toBe("Plain title");
  });

  it("builds the path and the locale-correct canonical URL", async () => {
    const english = await getArticle("fixture-article", "en", FIXTURES);
    const french = await getArticle("fixture-article", "fr", FIXTURES);

    expect(articlePath("fixture-article")).toBe("/articles/fixture-article");
    expect(english && articleUrl(english)).toMatch(
      /^https?:\/\/[^/]+\/articles\/fixture-article$/,
    );
    expect(french && articleUrl(french)).toMatch(
      /^https?:\/\/[^/]+\/fr\/articles\/fixture-article$/,
    );
  });
});

describe("articles directory", () => {
  it("is content/articles by default", () => {
    vi.stubEnv("ARTICLES_DIR", "");

    expect(articlesDirectory()).toBe(
      path.join(process.cwd(), "content", "articles"),
    );
  });

  it("is ARTICLES_DIR, resolved against the working directory", () => {
    vi.stubEnv("ARTICLES_DIR", "test/fixtures/articles");

    expect(articlesDirectory()).toBe(
      path.resolve(process.cwd(), "test/fixtures/articles"),
    );
  });

  it("is what the loader reads when no directory is passed", async () => {
    vi.stubEnv("ARTICLES_DIR", FIXTURES);

    expect(ids(await getPublishedArticles())).toEqual([
      "fixture-article/en",
      "fixture-article/fr",
      "fixture-older/en",
      "fixture-older/fr",
    ]);
  });
});

describe("article loader", () => {
  it("reads every file, drafts included", async () => {
    const all = await getAllArticles(FIXTURES);

    expect(ids(all).sort()).toEqual([
      "fixture-article/en",
      "fixture-article/fr",
      "fixture-draft/en",
      "fixture-older/en",
      "fixture-older/fr",
    ]);
  });

  it("publishes newest first, with a draft left out", async () => {
    const published = await getPublishedArticles(FIXTURES);

    expect(ids(published)).toEqual([
      "fixture-article/en",
      "fixture-article/fr",
      "fixture-older/en",
      "fixture-older/fr",
    ]);
    expect(published.some((article) => article.frontmatter.draft)).toBe(false);
  });

  it("lists one locale, newest first", async () => {
    const french = await getArticles("fr", FIXTURES);

    expect(ids(french)).toEqual(["fixture-article/fr", "fixture-older/fr"]);
  });

  it("returns a published article with its parsed frontmatter", async () => {
    const article = await getArticle("fixture-article", "en", FIXTURES);

    expect(article?.frontmatter).toMatchObject({
      components: ["button"],
      date: "2026-10-05",
      draft: false,
      image: {
        alt: "A fixture card showing a frosted panel",
        src: "/fixture-article-card.png",
      },
      status: "mixed",
      updated: "2026-11-02",
    });
  });

  it("defaults updated to date when the file has none", async () => {
    const article = await getArticle("fixture-older", "en", FIXTURES);

    expect(article?.frontmatter.updated).toBe("2026-09-01");
  });

  it("does not return a draft, an unknown slug or a locale without a file", async () => {
    expect(await getArticle("fixture-draft", "en", FIXTURES)).toBeUndefined();
    expect(await getArticle("no-such-slug", "en", FIXTURES)).toBeUndefined();
    expect(await getArticle("fixture-draft", "fr", FIXTURES)).toBeUndefined();
  });

  it("treats a missing directory as an empty collection", async () => {
    const missing = path.join(FIXTURES, "does-not-exist");

    expect(await getAllArticles(missing)).toEqual([]);
    expect(await getPublishedArticles(missing)).toEqual([]);
    expect(await getArticles("en", missing)).toEqual([]);
  });

  it("does not hide a read error behind an empty collection", async () => {
    const notADirectory = path.join(FIXTURES, "fixture-article", "en.mdx");

    await expect(getAllArticles(notADirectory)).rejects.toThrow();
  });

  it("refuses a folder that is not kebab-case", async () => {
    await expect(getAllArticles(invalidFixtures("bad-slug"))).rejects.toThrow(
      'Invalid article slug "Not_Kebab"',
    );
  });

  it("refuses a locale file that is not configured", async () => {
    await expect(
      getAllArticles(invalidFixtures("unknown-locale")),
    ).rejects.toThrow("Unknown locale file content/articles/some-slug/de.mdx");
  });

  it("names the file and the field of invalid frontmatter", async () => {
    await expect(
      getAllArticles(invalidFixtures("bad-frontmatter")),
    ).rejects.toThrow(/content\/articles\/some-slug\/en\.mdx: status:/);
  });

  it("lists the locales an article exists in, in locale order", async () => {
    const published = await getPublishedArticles(FIXTURES);

    expect(articleLocales(published, "fixture-article")).toEqual(["en", "fr"]);
    expect(articleLocales(published, "fixture-draft")).toEqual([]);
  });
});

describe("findArticleCoverageIssues", () => {
  it("is empty when every published article has every locale", async () => {
    const all = await getAllArticles(FIXTURES);

    expect(findArticleCoverageIssues(all)).toEqual([]);
  });

  it("exempts an article whose files are all drafts", async () => {
    const all = await getAllArticles(FIXTURES);
    const draftOnly = all.filter((article) => article.slug === "fixture-draft");

    expect(draftOnly).toHaveLength(1);
    expect(findArticleCoverageIssues(draftOnly)).toEqual([]);
  });

  it("reports a published article that lacks a locale", async () => {
    const all = await getAllArticles(FIXTURES);
    const missingFrench = all.filter(
      (article) =>
        !(article.slug === "fixture-older" && article.locale === "fr"),
    );

    expect(findArticleCoverageIssues(missingFrench)).toEqual([
      'article "fixture-older" is missing fr.mdx (present: en)',
    ]);
  });

  it("reports a published article that exists in one locale only", async () => {
    const all = await getAllArticles(FIXTURES);
    const published = all.map((article) =>
      article.slug === "fixture-draft"
        ? { ...article, frontmatter: { ...article.frontmatter, draft: false } }
        : article,
    );

    expect(findArticleCoverageIssues(published)).toEqual([
      'article "fixture-draft" is missing fr.mdx (present: en)',
    ]);
  });

  it("keeps a draft file in the count for a published sibling", async () => {
    const all = await getAllArticles(FIXTURES);
    const draftFrench = all.map((article) =>
      article.slug === "fixture-older" && article.locale === "fr"
        ? { ...article, frontmatter: { ...article.frontmatter, draft: true } }
        : article,
    );

    expect(findArticleCoverageIssues(draftFrench)).toEqual([]);
  });
});
