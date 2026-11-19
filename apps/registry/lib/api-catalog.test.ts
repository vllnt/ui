import { describe, expect, it } from "vitest";

import { API_CATALOG_CONTENT_TYPE, buildApiCatalog } from "@/lib/api-catalog";
import { registry } from "@/lib/registry";

describe("api catalog", () => {
  const catalog = buildApiCatalog();
  const index = catalog.linkset.find((entry) =>
    entry.anchor.endsWith("/r/registry.json"),
  );

  it("is a linkset whose entries are anchored at absolute API URLs", () => {
    const relative = catalog.linkset.filter(
      (entry) => !URL.canParse(entry.anchor),
    );

    expect(catalog.linkset.length).toBeGreaterThan(0);
    expect(relative).toEqual([]);
  });

  it("links every registry component's JSON document", () => {
    const hrefs = new Set(index?.item?.map((link) => link.href));
    const missing = registry.items
      .map((component) => `https://ui.vllnt.com/r/${component.name}.json`)
      .filter((href) => !hrefs.has(href));

    expect(hrefs.size).toBe(registry.items.length);
    expect(missing).toEqual([]);
  });

  it.each(["/r/registry.json", "/mcp"])("points %s at llms.txt", (anchor) => {
    const entry = catalog.linkset.find((candidate) =>
      candidate.anchor.endsWith(anchor),
    );

    expect(entry?.["service-doc"]?.map((link) => link.href)).toContain(
      "https://ui.vllnt.com/llms.txt",
    );
  });

  it("uses the media type RFC 9727 names", () => {
    expect(API_CATALOG_CONTENT_TYPE).toBe(
      'application/linkset+json; profile="https://www.rfc-editor.org/info/rfc9727"',
    );
  });
});
