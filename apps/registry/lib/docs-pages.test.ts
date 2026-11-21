import { describe, expect, it } from "vitest";

import { DOCS_PAGES, getDocsPage, getDocsPath } from "@/lib/docs-pages";

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
