import { fileURLToPath } from "node:url";

import { beforeAll, describe, expect, it } from "vitest";

import { type Article, getPublishedArticles } from "./articles";
import { buildSitemap, latestChangelogDate } from "./sitemap";

const FIXTURES = fileURLToPath(
  new URL("../test/fixtures/articles", import.meta.url),
);
const SITE = "https://ui.vllnt.com";
const BUILD_DATE = new Date("2026-11-20T10:00:00.000Z");
const CHANGELOG_DATE = "2026-11-18";
const REGISTRY_DATE = "2026-11-15T09:00:00.000Z";

let articles: readonly Article[];

beforeAll(async () => {
  articles = await getPublishedArticles(FIXTURES);
});

function dated(input: { articles: readonly Article[] }) {
  return buildSitemap({
    ...input,
    buildDate: BUILD_DATE,
    changelogDate: CHANGELOG_DATE,
    registryDate: REGISTRY_DATE,
  });
}

function urls(entries: ReturnType<typeof dated>): string[] {
  return entries.map((entry) => entry.url);
}

describe("sitemap URLs", () => {
  it("contains no query-string URL", () => {
    const withArticles = urls(dated({ articles }));
    const withoutArticles = urls(dated({ articles: [] }));

    expect(withArticles.filter((url) => url.includes("?"))).toEqual([]);
    expect(withoutArticles.filter((url) => url.includes("?"))).toEqual([]);
  });

  it("lists the request and report pages in both locales", () => {
    const all = urls(dated({ articles }));

    expect(all).toEqual(
      expect.arrayContaining([
        `${SITE}/request-component`,
        `${SITE}/fr/request-component`,
        `${SITE}/report`,
        `${SITE}/fr/report`,
      ]),
    );
  });

  it("no longer lists the platform=native variants", () => {
    const all = urls(dated({ articles }));

    expect(all).not.toContain(`${SITE}/components?platform=native`);
    expect(all).not.toContain(`${SITE}/docs/installation?platform=native`);
    expect(all.some((url) => url.includes("platform="))).toBe(false);
  });

  it("keeps the clean catalog and installation pages in both locales", () => {
    const all = urls(dated({ articles }));

    expect(all).toEqual(
      expect.arrayContaining([
        `${SITE}/components`,
        `${SITE}/fr/components`,
        `${SITE}/docs/installation`,
        `${SITE}/fr/docs/installation`,
      ]),
    );
  });

  it("lists the merged Vision page in both locales and no URL that redirects to it", () => {
    const all = urls(dated({ articles }));

    expect(all).toEqual(
      expect.arrayContaining([`${SITE}/vision`, `${SITE}/fr/vision`]),
    );
    expect(
      all.filter((url) => /\/(philosophy|docs\/vision)$/.test(url)),
    ).toEqual([]);
  });

  it("lists every URL once, absolute and over https", () => {
    const all = urls(dated({ articles }));

    expect(new Set(all).size).toBe(all.length);
    expect(all.filter((url) => !url.startsWith("https://"))).toEqual([]);
  });
});

describe("sitemap articles", () => {
  it("lists each article in its own locale, dated by its updated date", () => {
    const entries = dated({ articles });
    const byUrl = new Map(entries.map((entry) => [entry.url, entry]));

    expect(byUrl.get(`${SITE}/articles/fixture-article`)?.lastModified).toBe(
      "2026-11-02",
    );
    expect(byUrl.get(`${SITE}/fr/articles/fixture-article`)?.lastModified).toBe(
      "2026-11-02",
    );
    expect(byUrl.get(`${SITE}/articles/fixture-older`)?.lastModified).toBe(
      "2026-09-01",
    );
    expect(byUrl.get(`${SITE}/fr/articles/fixture-older`)?.lastModified).toBe(
      "2026-09-01",
    );
  });

  it("gives each article its hreflang alternates", () => {
    const entry = dated({ articles }).find(
      (item) => item.url === `${SITE}/fr/articles/fixture-article`,
    );

    expect(entry?.alternates?.languages).toEqual({
      en: `${SITE}/articles/fixture-article`,
      fr: `${SITE}/fr/articles/fixture-article`,
      "x-default": `${SITE}/articles/fixture-article`,
    });
  });

  it("lists the index of each locale, dated by its newest update", () => {
    const entries = dated({ articles });
    const english = entries.find((entry) => entry.url === `${SITE}/articles`);
    const french = entries.find((entry) => entry.url === `${SITE}/fr/articles`);

    expect(english?.lastModified).toBe("2026-11-02");
    expect(french?.lastModified).toBe("2026-11-02");
  });

  it("lists no article URL and no index while there is no article", () => {
    const all = urls(dated({ articles: [] }));

    expect(all.filter((url) => url.includes("/articles"))).toEqual([]);
  });

  it("indexes only the locales that have an article", () => {
    const englishOnly = articles.filter((article) => article.locale === "en");
    const all = urls(dated({ articles: englishOnly }));

    expect(all).toContain(`${SITE}/articles`);
    expect(all).not.toContain(`${SITE}/fr/articles`);
    expect(all).not.toContain(`${SITE}/fr/articles/fixture-article`);
  });

  it("declares a one-locale article as itself and x-default only", () => {
    const englishOnly = articles.filter((article) => article.locale === "en");
    const entry = dated({ articles: englishOnly }).find(
      (item) => item.url === `${SITE}/articles/fixture-article`,
    );

    expect(entry?.alternates?.languages).toEqual({
      en: `${SITE}/articles/fixture-article`,
      "x-default": `${SITE}/articles/fixture-article`,
    });
  });
});

function lastModified(url: string): unknown {
  return dated({ articles }).find((entry) => entry.url === url)?.lastModified;
}

describe("sitemap lastmod", () => {
  it("dates the changelog and the release page by the newest release", () => {
    expect(lastModified(`${SITE}/changelog`)).toBe(CHANGELOG_DATE);
    expect(lastModified(`${SITE}/releases`)).toBe(CHANGELOG_DATE);
    expect(lastModified(`${SITE}/fr/changelog`)).toBe(CHANGELOG_DATE);
  });

  it("dates components and registry files by the registry stamp", () => {
    expect(lastModified(`${SITE}/components/button`)).toBe(REGISTRY_DATE);
    expect(lastModified(`${SITE}/fr/components/button`)).toBe(REGISTRY_DATE);
    expect(lastModified(`${SITE}/r/registry.json`)).toBe(REGISTRY_DATE);
    expect(lastModified(`${SITE}/r/button.json`)).toBe(REGISTRY_DATE);
  });

  it("dates pages that have no date of their own by the build", () => {
    expect(lastModified(`${SITE}/docs`)).toEqual(BUILD_DATE);
    expect(lastModified(`${SITE}/docs/installation`)).toEqual(BUILD_DATE);
    expect(lastModified(`${SITE}/families`)).toEqual(BUILD_DATE);
    expect(lastModified(SITE)).toEqual(BUILD_DATE);
    expect(lastModified(`${SITE}/DESIGN.md`)).toEqual(BUILD_DATE);
  });

  it("falls back to the build date when a source date is unknown", () => {
    const entries = buildSitemap({ articles: [], buildDate: BUILD_DATE });
    const pick = (url: string) =>
      entries.find((entry) => entry.url === url)?.lastModified;

    expect(pick(`${SITE}/changelog`)).toEqual(BUILD_DATE);
    expect(pick(`${SITE}/components/button`)).toEqual(BUILD_DATE);
    expect(pick(`${SITE}/r/registry.json`)).toEqual(BUILD_DATE);
  });

  it("gives every entry a date", () => {
    const entries = dated({ articles });

    expect(entries.filter((entry) => !entry.lastModified)).toEqual([]);
  });
});

describe("latestChangelogDate", () => {
  it("returns the newest date and skips undated entries", () => {
    expect(
      latestChangelogDate([
        { date: "2026-11-01" },
        {},
        { date: "2026-11-18" },
        { date: "2026-10-30" },
      ]),
    ).toBe("2026-11-18");
  });

  it("is undefined when no entry has a date", () => {
    expect(latestChangelogDate([])).toBeUndefined();
    expect(latestChangelogDate([{}, {}])).toBeUndefined();
  });
});
