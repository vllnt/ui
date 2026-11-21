import { describe, expect, it } from "vitest";

import { DOCS_PAGES, getDocsPage, getDocsPath } from "@/lib/docs-pages";

describe("DOCS_PAGES", () => {
  it("does not list Vision, which lives at the top level at /vision", () => {
    expect(getDocsPage("vision")).toBeUndefined();
    expect(DOCS_PAGES.map((page) => page.slug)).not.toContain("vision");
  });
});

describe("getDocsPath", () => {
  it("points the changelog at its final URL, not at the redirecting docs path", () => {
    const changelog = getDocsPage("changelog");

    if (!changelog) throw new Error("the changelog docs page is missing");
    expect(getDocsPath(changelog)).toBe("/changelog");
  });

  it("keeps every other docs page under /docs", () => {
    const others = DOCS_PAGES.filter((page) => page.slug !== "changelog");

    expect(others.length).toBeGreaterThan(0);
    expect(others.map((page) => getDocsPath(page))).toEqual(
      others.map((page) => `/docs/${page.slug}`),
    );
  });
});
