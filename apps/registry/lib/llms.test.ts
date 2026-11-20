import { fileURLToPath } from "node:url";

import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";

import { type Article, getPublishedArticles } from "./articles";
import {
  buildArticlePages,
  buildArticlesSection,
  buildLlmsTxt,
} from "./llms";

const FIXTURES = fileURLToPath(
  new URL("../test/fixtures/articles", import.meta.url),
);
const SITE = "https://ui.vllnt.com";

let articles: readonly Article[];

beforeAll(async () => {
  articles = await getPublishedArticles(FIXTURES);
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("buildArticlesSection", () => {
  it("is no section while there is no article", () => {
    expect(buildArticlesSection([])).toEqual([]);
  });

  it("lists the default-locale articles with title, URL and description", () => {
    const [section] = buildArticlesSection(articles);

    expect(section?.title).toBe("Articles");
    expect(section?.links.slice(0, 2)).toEqual([
      {
        notes: articles[0]?.frontmatter.description,
        title: "Fixture article on glass surfaces | vllnt UI",
        url: `${SITE}/articles/fixture-article`,
      },
      {
        notes: articles[2]?.frontmatter.description,
        title: "Fixture older article | vllnt UI",
        url: `${SITE}/articles/fixture-older`,
      },
    ]);
  });

  it("ends with the feed of the default locale and lists no other locale", () => {
    const [section] = buildArticlesSection(articles);
    const urls = section?.links.map((link) => link.url) ?? [];

    expect(urls.at(-1)).toBe(`${SITE}/articles/en/rss.xml`);
    expect(urls.filter((url) => url.includes("/fr/articles/"))).toEqual([]);
    expect(urls).toHaveLength(3);
  });
});

describe("buildArticlePages", () => {
  it("is empty while there is no article", () => {
    expect(buildArticlePages([])).toEqual([]);
  });

  it("gives each default-locale article its description and body", () => {
    const pages = buildArticlePages(articles);

    expect(pages.map((page) => page.url)).toEqual([
      `${SITE}/articles/fixture-article`,
      `${SITE}/articles/fixture-older`,
    ]);
    expect(pages[1]).toEqual({
      content: `${articles[2]?.frontmatter.description}\n\nThe body of the older fixture article.`,
      title: "Fixture older article | vllnt UI",
      url: `${SITE}/articles/fixture-older`,
    });
  });

  it("leaves the repeated heading out of the body", () => {
    const [first] = buildArticlePages(articles);

    expect(first?.content).not.toContain("# Glass surfaces in a fixture");
    expect(first?.content).toContain("## What ships");
  });
});

describe("buildLlmsTxt", () => {
  it("lists the articles between the docs and the registry sections", async () => {
    const text = await buildLlmsTxt(articles);
    const docs = text.indexOf("## Docs");
    const listed = text.indexOf("## Articles");
    const registry = text.indexOf("## Registry API");

    expect(docs).toBeGreaterThan(-1);
    expect(listed).toBeGreaterThan(docs);
    expect(registry).toBeGreaterThan(listed);
    expect(text).toContain(`${SITE}/articles/fixture-article`);
    expect(text).toContain("A fixture article that exercises every frontmatter field");
  });

  it("has no Articles section and no article URL without articles", async () => {
    const text = await buildLlmsTxt([]);

    expect(text).not.toContain("## Articles");
    expect(text).not.toContain("/articles/");
  });

  it("reads the published articles of ARTICLES_DIR by default", async () => {
    vi.stubEnv("ARTICLES_DIR", FIXTURES);
    const text = await buildLlmsTxt();

    expect(text).toContain(`${SITE}/articles/fixture-older`);
    expect(text).not.toContain("fixture-draft");
  });
});
