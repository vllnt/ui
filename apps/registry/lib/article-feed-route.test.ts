import path from "node:path";
import { fileURLToPath } from "node:url";

import { afterEach, describe, expect, it, vi } from "vitest";

import { articleFeedResponse } from "./article-feed-route";

const FIXTURES = fileURLToPath(
  new URL("../test/fixtures/articles", import.meta.url),
);

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("articleFeedResponse", () => {
  it("serves the RSS feed of a locale with its headers", async () => {
    vi.stubEnv("ARTICLES_DIR", FIXTURES);
    const response = await articleFeedResponse("en", "rss");
    const body = await response.text();

    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toBe(
      "application/rss+xml; charset=utf-8",
    );
    expect(response.headers.get("cache-control")).toMatch(/s-maxage=\d+/);
    expect(body).toContain("<title>VLLNT UI Articles</title>");
    expect(body).toContain("/articles/fixture-article</link>");
    expect(body).toContain("/articles/fixture-older</link>");
    expect(body).not.toContain("/fr/articles/");
  });

  it("serves the Atom feed of a locale with its headers", async () => {
    vi.stubEnv("ARTICLES_DIR", FIXTURES);
    const response = await articleFeedResponse("en", "atom");
    const body = await response.text();

    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toBe(
      "application/atom+xml; charset=utf-8",
    );
    expect(body).toContain("<title>VLLNT UI Articles</title>");
    expect(body).toContain("/articles/fixture-article</id>");
  });

  it("serves the French feeds from the French articles and messages", async () => {
    vi.stubEnv("ARTICLES_DIR", FIXTURES);
    const rss = await (await articleFeedResponse("fr", "rss")).text();
    const atom = await (await articleFeedResponse("fr", "atom")).text();

    expect(rss).toContain("<title>Articles VLLNT UI</title>");
    expect(rss).toContain("/fr/articles/fixture-article</link>");
    expect(rss).not.toContain("<link>https://ui.vllnt.com/articles/fixture");
    expect(atom).toContain("<title>Articles VLLNT UI</title>");
    expect(atom).toContain("/fr/articles/fixture-older</id>");
  });

  it("answers 404 for a locale that is not configured", async () => {
    vi.stubEnv("ARTICLES_DIR", FIXTURES);

    for (const format of ["rss", "atom"] as const) {
      const response = await articleFeedResponse("de", format);

      expect(response.status).toBe(404);
      expect(response.headers.get("cache-control")).toBe("no-store");
    }
  });

  it("serves a valid empty feed when the collection is empty", async () => {
    vi.stubEnv("ARTICLES_DIR", path.join(FIXTURES, "does-not-exist"));
    const rss = await (await articleFeedResponse("en", "rss")).text();
    const atom = await (await articleFeedResponse("en", "atom")).text();

    expect(rss).toContain("<channel>");
    expect(rss).not.toContain("<item>");
    expect(atom).toContain("<feed ");
    expect(atom).not.toContain("<entry>");
  });
});
