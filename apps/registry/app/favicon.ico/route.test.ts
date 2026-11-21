import { describe, expect, it } from "vitest";

import { GET } from "./route";

describe("GET /favicon.ico", () => {
  it("sends the request to the brand icon with a relative, cacheable redirect", () => {
    const response = GET();

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("/icon.svg");
    expect(response.headers.get("cache-control")).toBe("public, max-age=86400");
  });
});
