import { fileURLToPath } from "node:url";

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { GET as atomFeed } from "@/app/atom.xml/route";
import { GET as rssFeed } from "@/app/rss.xml/route";

import { getReleaseRecords, releasePageUrl } from "./changelog";

const FIXTURES = fileURLToPath(
  new URL("../test/fixtures/articles", import.meta.url),
);
const SITE = "https://ui.vllnt.com";

/**
 * The release feeds at `/rss.xml` and `/atom.xml` are not part of the articles
 * feature. With published articles present and GitHub unreachable, they still
 * list the dated releases of the changelog and nothing else, link to the
 * release page, and keep their own channel identity.
 */
beforeEach(() => {
  vi.stubEnv("ARTICLES_DIR", FIXTURES);
  vi.stubGlobal(
    "fetch",
    vi.fn(() => Promise.reject(new Error("offline"))),
  );
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

function count(text: string, needle: string): number {
  return text.split(needle).length - 1;
}

async function datedReleases(): ReturnType<typeof getReleaseRecords> {
  const releases = await getReleaseRecords();

  return releases.filter((release) => release.date !== undefined);
}

function missing(body: string, links: readonly string[]): readonly string[] {
  return links.filter((link) => !body.includes(link));
}

describe("release feeds are unchanged by articles", () => {
  it("keeps the RSS channel and lists exactly the dated releases", async () => {
    const releases = await datedReleases();
    const response = await rssFeed();
    const body = await response.text();

    expect(releases.length).toBeGreaterThan(0);
    expect(response.headers.get("content-type")).toBe(
      "application/rss+xml; charset=utf-8",
    );
    expect(body).toContain("<title>VLLNT UI Releases</title>");
    expect(body).toContain(`<link>${SITE}/releases</link>`);
    expect(body).toContain("<language>en-US</language>");
    expect(body).not.toContain("xmlns:atom");
    expect(count(body, "<item>")).toBe(releases.length);
    expect(
      missing(
        body,
        releases.map((release) => `<link>${releasePageUrl(release)}</link>`),
      ),
    ).toEqual([]);
    expect(body).not.toContain(`${SITE}/articles`);
    expect(body).not.toContain(`${SITE}/fr/articles`);
    expect(body).not.toContain("fixture-");
  });

  it("keeps the Atom channel and lists exactly the dated releases", async () => {
    const releases = await datedReleases();
    const response = await atomFeed();
    const body = await response.text();

    expect(releases.length).toBeGreaterThan(0);
    expect(response.headers.get("content-type")).toBe(
      "application/atom+xml; charset=utf-8",
    );
    expect(body).toContain("<title>VLLNT UI Releases</title>");
    expect(body).toContain(`<link rel="self" href="${SITE}/atom.xml" />`);
    expect(count(body, "<entry>")).toBe(releases.length);
    expect(
      missing(
        body,
        releases.map((release) => `<link href="${releasePageUrl(release)}" />`),
      ),
    ).toEqual([]);
    expect(body).not.toContain(`${SITE}/articles`);
    expect(body).not.toContain(`${SITE}/fr/articles`);
    expect(body).not.toContain("fixture-");
  });
});
