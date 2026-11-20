import { describe, expect, it } from "vitest";

import { GET } from "./route";

async function readRobots(): Promise<{ groups: string[][]; text: string }> {
  const response = GET();
  const text = await response.text();
  const groups = text
    .trim()
    .split("\n\n")
    .map((block) => block.split("\n"));

  return { groups, text };
}

describe("robots.txt", () => {
  it("is plain text a CDN may cache", () => {
    const response = GET();

    expect(response.headers.get("content-type")).toBe(
      "text/plain; charset=utf-8",
    );
    expect(response.headers.get("cache-control")).toMatch(/s-maxage=\d+/);
  });

  it("carries a Content-Signal line in every user-agent group", async () => {
    const { groups } = await readRobots();
    const agentGroups = groups.filter((lines) =>
      lines[0]?.startsWith("User-Agent:"),
    );

    const unsigned = agentGroups.filter(
      (lines) =>
        !lines.includes(
          "Content-Signal: search=yes, ai-input=yes, ai-train=yes",
        ),
    );

    expect(agentGroups.length).toBeGreaterThan(1);
    expect(unsigned).toEqual([]);
  });

  it("keeps allowing every crawler, AI crawlers by name", async () => {
    const { groups } = await readRobots();
    const names = groups.map((lines) => lines[0]);

    expect(names).toContain("User-Agent: *");
    expect(names).toContain("User-Agent: GPTBot");
    expect(names).toContain("User-Agent: ClaudeBot");
    const restricted = groups
      .filter((entry) => entry[0]?.startsWith("User-Agent:"))
      .filter(
        (lines) =>
          !lines.includes("Allow: /") ||
          lines.some((line) => line.startsWith("Disallow:")),
      );

    expect(restricted).toEqual([]);
  });

  it("does not block the articles index, an article or an article feed", async () => {
    const { groups } = await readRobots();
    const blocked = groups
      .filter((lines) => lines[0]?.startsWith("User-Agent:"))
      .flatMap((lines) =>
        lines
          .filter((line) => line.startsWith("Disallow:"))
          .map((line) => line.slice("Disallow:".length).trim())
          .filter((prefix) => prefix !== ""),
      );
    const paths = [
      "/articles",
      "/articles/an-article",
      "/fr/articles",
      "/fr/articles/an-article",
      "/articles/en/rss.xml",
      "/articles/fr/atom.xml",
    ];

    expect(
      paths.filter((entry) =>
        blocked.some((prefix) => entry.startsWith(prefix)),
      ),
    ).toEqual([]);
  });

  it("points at the sitemap and the host", async () => {
    const { text } = await readRobots();

    expect(text).toMatch(/^Sitemap: https?:\/\/.+\/sitemap\.xml$/m);
    expect(text).toMatch(/^Host: https?:\/\/.+$/m);
  });
});
