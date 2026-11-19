import { describe, expect, it } from "vitest";

import { API_CATALOG_CONTENT_TYPE } from "@/lib/api-catalog";

import { GET } from "./route";

describe("/.well-known/api-catalog", () => {
  it("serves a linkset with the media type and profile RFC 9727 names", async () => {
    const response = GET();
    const body: unknown = await response.json();

    expect(response.headers.get("content-type")).toBe(API_CATALOG_CONTENT_TYPE);
    expect(response.headers.get("cache-control")).toMatch(/s-maxage=\d+/);
    expect(body).toMatchObject({
      linkset: [
        { anchor: "https://ui.vllnt.com/r/registry.json" },
        { anchor: "https://ui.vllnt.com/mcp" },
      ],
    });
  });
});
