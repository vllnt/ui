import { fileURLToPath } from "node:url";

import { beforeAll, describe, expect, it } from "vitest";

import {
  articleFeedPath,
  articleFeedUrl,
  buildArticlesAtom,
  buildArticlesRss,
} from "./article-feed";
import { type Article, getArticles, parseArticleSource } from "./articles";

const FIXTURES = fileURLToPath(
  new URL("../test/fixtures/articles", import.meta.url),
);
const SITE = "https://ui.vllnt.com";
const BUILD_DATE = new Date("2026-11-20T10:00:00.000Z");
const CHANNEL = {
  buildDate: BUILD_DATE,
  description: "Channel description.",
  title: "Channel title",
};

let english: readonly Article[];
let french: readonly Article[];

beforeAll(async () => {
  english = await getArticles("en", FIXTURES);
  french = await getArticles("fr", FIXTURES);
});

function isBalanced(xml: string): boolean {
  const tags = [...xml.matchAll(/<(\/?)([\w:]+)[^>]*?(\/?)>/g)].filter(
    (match) => match[3] !== "/",
  );
  const open = tags.reduce<readonly string[] | undefined>((stack, match) => {
    if (stack === undefined) return;
    const name = match[2] ?? "";
    if (match[1] !== "/") return [...stack, name];

    return stack.at(-1) === name ? stack.slice(0, -1) : undefined;
  }, []);

  return open?.length === 0;
}

function count(text: string, needle: string): number {
  return text.split(needle).length - 1;
}

describe("article feed URLs", () => {
  it("puts each locale's feeds under /articles/<locale>/", () => {
    expect(articleFeedPath("en", "rss")).toBe("/articles/en/rss.xml");
    expect(articleFeedPath("en", "atom")).toBe("/articles/en/atom.xml");
    expect(articleFeedPath("fr", "rss")).toBe("/articles/fr/rss.xml");
    expect(articleFeedPath("fr", "atom")).toBe("/articles/fr/atom.xml");
  });

  it("builds absolute URLs", () => {
    expect(articleFeedUrl("fr", "atom")).toBe(`${SITE}/articles/fr/atom.xml`);
  });

  it.each([
    ["en", "rss"],
    ["en", "atom"],
    ["fr", "rss"],
    ["fr", "atom"],
  ] as const)(
    "%s %s never collides with the release feeds",
    (locale, format) => {
      expect(articleFeedPath(locale, format)).not.toBe("/rss.xml");
      expect(articleFeedPath(locale, format)).not.toBe("/atom.xml");
    },
  );
});

describe("buildArticlesRss", () => {
  it("is a well-formed RSS 2.0 channel for the locale", () => {
    const xml = buildArticlesRss("en", english, CHANNEL);

    expect(xml.startsWith('<?xml version="1.0" encoding="UTF-8"?>')).toBe(true);
    expect(xml).toContain('<rss version="2.0"');
    expect(isBalanced(xml)).toBe(true);
    expect(xml).toContain("<title>Channel title</title>");
    expect(xml).toContain(`<link>${SITE}/articles</link>`);
    expect(xml).toContain("<description>Channel description.</description>");
    expect(xml).toContain("<language>en-US</language>");
    expect(xml).toContain(
      `<atom:link href="${SITE}/articles/en/rss.xml" rel="self" type="application/rss+xml" />`,
    );
  });

  it("lists the articles in the order given, one item each", () => {
    const xml = buildArticlesRss("en", english, CHANNEL);

    expect(count(xml, "<item>")).toBe(2);
    expect(
      xml.indexOf(`${SITE}/articles/fixture-article</link>`),
    ).toBeGreaterThan(-1);
    expect(xml.indexOf("fixture-article</link>")).toBeLessThan(
      xml.indexOf("fixture-older</link>"),
    );
  });

  it("gives each item its permalink, publication date, summary and tags", () => {
    const xml = buildArticlesRss("en", english, CHANNEL);

    expect(xml).toContain(
      `<guid isPermaLink="true">${SITE}/articles/fixture-article</guid>`,
    );
    expect(xml).toContain("<pubDate>Mon, 05 Oct 2026 00:00:00 GMT</pubDate>");
    expect(xml).toContain(
      "<title>Fixture article on glass surfaces | vllnt UI</title>",
    );
    expect(xml).toContain("<category>glass-surfaces</category>");
  });

  it("dates the channel by the newest update", () => {
    const xml = buildArticlesRss("en", english, CHANNEL);

    expect(xml).toContain(
      "<lastBuildDate>Mon, 02 Nov 2026 00:00:00 GMT</lastBuildDate>",
    );
  });

  it("serves the French feed with French URLs and language", () => {
    const xml = buildArticlesRss("fr", french, CHANNEL);

    expect(xml).toContain("<language>fr-FR</language>");
    expect(xml).toContain(`<link>${SITE}/fr/articles</link>`);
    expect(xml).toContain(`<link>${SITE}/fr/articles/fixture-article</link>`);
    expect(xml).toContain(`href="${SITE}/articles/fr/rss.xml"`);
    expect(xml).not.toContain(`<link>${SITE}/articles/fixture-article</link>`);
  });

  it("escapes markup in titles, descriptions and tags", () => {
    const tricky = parseArticleSource(
      `---\n${JSON.stringify({
        date: "2026-10-05",
        description: "It's <b>bold</b> & more",
        status: "shipped",
        tags: ["a-b"],
        title: 'Tom & "Jerry" <script>',
      })}\n---\n# Heading\n`,
      { locale: "en", slug: "tricky" },
    );
    const xml = buildArticlesRss("en", [tricky], CHANNEL);

    expect(xml).toContain(
      "<title>Tom &amp; &quot;Jerry&quot; &lt;script&gt;</title>",
    );
    expect(xml).toContain(
      "<description>It&apos;s &lt;b&gt;bold&lt;/b&gt; &amp; more</description>",
    );
    expect(xml).not.toContain("<script>");
    expect(isBalanced(xml)).toBe(true);
  });

  it("is a valid empty channel dated by the build when there is no article", () => {
    const xml = buildArticlesRss("en", [], CHANNEL);

    expect(count(xml, "<item>")).toBe(0);
    expect(isBalanced(xml)).toBe(true);
    expect(xml).toContain(
      `<lastBuildDate>${BUILD_DATE.toUTCString()}</lastBuildDate>`,
    );
  });
});

describe("buildArticlesAtom", () => {
  it("is a well-formed Atom feed for the locale", () => {
    const xml = buildArticlesAtom("en", english, CHANNEL);

    expect(xml).toContain(
      '<feed xmlns="http://www.w3.org/2005/Atom" xml:lang="en">',
    );
    expect(isBalanced(xml)).toBe(true);
    expect(xml).toContain("<title>Channel title</title>");
    expect(xml).toContain("<subtitle>Channel description.</subtitle>");
    expect(xml).toContain(`<id>${SITE}/articles</id>`);
    expect(xml).toContain(
      `<link rel="self" href="${SITE}/articles/en/atom.xml" />`,
    );
    expect(xml).toContain("<author><name>vllnt</name></author>");
    expect(xml).toContain("<updated>2026-11-02T00:00:00.000Z</updated>");
  });

  it("lists one entry per article with its dates, summary and tags", () => {
    const xml = buildArticlesAtom("en", english, CHANNEL);

    expect(count(xml, "<entry>")).toBe(2);
    expect(xml.indexOf("fixture-article</id>")).toBeLessThan(
      xml.indexOf("fixture-older</id>"),
    );
    expect(xml).toContain(`<id>${SITE}/articles/fixture-article</id>`);
    expect(xml).toContain(`<link href="${SITE}/articles/fixture-article" />`);
    expect(xml).toContain("<published>2026-10-05T00:00:00.000Z</published>");
    expect(xml).toContain('<category term="glass-surfaces" />');
  });

  it("serves the French feed with French URLs and language", () => {
    const xml = buildArticlesAtom("fr", french, CHANNEL);

    expect(xml).toContain('xml:lang="fr"');
    expect(xml).toContain(`<id>${SITE}/fr/articles</id>`);
    expect(xml).toContain(`<id>${SITE}/fr/articles/fixture-article</id>`);
    expect(xml).toContain(`href="${SITE}/articles/fr/atom.xml"`);
  });

  it("is a valid empty feed dated by the build when there is no article", () => {
    const xml = buildArticlesAtom("en", [], CHANNEL);

    expect(count(xml, "<entry>")).toBe(0);
    expect(isBalanced(xml)).toBe(true);
    expect(xml).toContain(`<updated>${BUILD_DATE.toISOString()}</updated>`);
  });
});
