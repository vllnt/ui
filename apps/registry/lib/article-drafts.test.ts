import { fileURLToPath } from "node:url";

import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

vi.mock("@/i18n/routing", async () => {
  const { defaultLocale, locales } = await import("@/i18n/locales");

  return { routing: { defaultLocale, locales } };
});

import { GET as llms } from "@/app/llms.txt/route";
import { GET as llmsFull } from "@/app/llms-full.txt/route";
import sitemap from "@/app/sitemap";

import { articleFeedResponse } from "./article-feed-route";
import { getAllArticles, getArticle, getArticles } from "./articles";

const FIXTURES = fileURLToPath(
  new URL("../test/fixtures/articles", import.meta.url),
);
const DRAFT_SLUG = "fixture-draft";
const DRAFT_MARKER = "DRAFT-ONLY-MARKER-7f3a";
const PUBLISHED_SLUG = "fixture-article";

const SURFACES = [
  "article index data (en)",
  "article index data (fr)",
  "sitemap",
  "article RSS (en)",
  "article RSS (fr)",
  "article Atom (en)",
  "article Atom (fr)",
  "llms.txt",
  "llms-full.txt",
] as const;

const rendered = new Map<string, string>();

function surface(name: string): string {
  const text = rendered.get(name);
  if (text === undefined) throw new Error(`surface not rendered: ${name}`);

  return text;
}

async function bodyOf(
  respond: () => Promise<Response> | Response,
): Promise<string> {
  const response = await respond();

  return response.text();
}

async function feed(
  locale: "en" | "fr",
  format: "atom" | "rss",
): Promise<string> {
  return bodyOf(() => articleFeedResponse(locale, format));
}

/**
 * The white paper lands as `draft: true` and must stay out of every public
 * surface. The real code of each surface renders the fixture collection,
 * which holds a published article and a draft. The published article acts as
 * the control: it must appear everywhere the draft must not, so an empty
 * surface cannot pass the test.
 */
beforeAll(async () => {
  vi.stubEnv("ARTICLES_DIR", FIXTURES);
  vi.stubGlobal(
    "fetch",
    vi.fn(() => Promise.reject(new Error("offline"))),
  );

  const [english, french, entries] = await Promise.all([
    getArticles("en"),
    getArticles("fr"),
    sitemap(),
  ]);
  const index = (articles: typeof english) =>
    articles
      .map((article) => `${article.slug} ${article.frontmatter.title}`)
      .join("\n");

  rendered.set("article index data (en)", index(english));
  rendered.set("article index data (fr)", index(french));
  rendered.set(
    "sitemap",
    entries
      .map((entry) => `${entry.url} ${JSON.stringify(entry.alternates ?? {})}`)
      .join("\n"),
  );
  rendered.set("article RSS (en)", await feed("en", "rss"));
  rendered.set("article RSS (fr)", await feed("fr", "rss"));
  rendered.set("article Atom (en)", await feed("en", "atom"));
  rendered.set("article Atom (fr)", await feed("fr", "atom"));
  rendered.set("llms.txt", await bodyOf(llms));
  rendered.set("llms-full.txt", await bodyOf(llmsFull));
});

afterAll(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe("a draft article", () => {
  it("exists in the collection, so the exclusion is not vacuous", async () => {
    const all = await getAllArticles(FIXTURES);

    expect(
      all.some(
        (article) => article.slug === DRAFT_SLUG && article.frontmatter.draft,
      ),
    ).toBe(true);
  });

  it.each(SURFACES)("is absent from %s", (name) => {
    expect(surface(name)).not.toContain(DRAFT_SLUG);
    expect(surface(name)).not.toContain(DRAFT_MARKER);
  });

  it.each(SURFACES)("leaves the published article in %s", (name) => {
    expect(surface(name)).toContain(PUBLISHED_SLUG);
  });

  it("has no page: the article loader refuses it in every locale", async () => {
    expect(await getArticle(DRAFT_SLUG, "en")).toBeUndefined();
    expect(await getArticle(DRAFT_SLUG, "fr")).toBeUndefined();
  });
});
