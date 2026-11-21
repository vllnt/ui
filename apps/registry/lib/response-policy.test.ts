import { describe, expect, it } from "vitest";

import {
  acceptsHtml,
  applyResponsePolicy,
  DOCUMENT_CACHE_CONTROL,
  mergeVary,
  UNCACHED,
} from "./response-policy";

function answer(headers: Record<string, string> = {}) {
  return { headers: new Headers(headers) };
}

describe("mergeVary", () => {
  it("keeps existing names and adds new ones once, case-insensitively", () => {
    expect(mergeVary("Accept, rsc", ["RSC", "accept", "next-url"])).toBe(
      "Accept, rsc, next-url",
    );
  });

  it("starts from nothing", () => {
    expect(mergeVary(undefined, ["rsc"])).toBe("rsc");
    expect(mergeVary(" , ", ["rsc"])).toBe("rsc");
  });
});

describe("acceptsHtml", () => {
  it("is true for a browser page load and false for router fetches and bare clients", () => {
    expect(
      acceptsHtml(
        new Headers({
          accept:
            "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        }),
      ),
    ).toBe(true);
    expect(acceptsHtml(new Headers({ accept: "*/*" }))).toBe(false);
    expect(acceptsHtml(new Headers())).toBe(false);
  });
});

describe("applyResponsePolicy", () => {
  const page = { headers: new Headers({ accept: "text/html" }) };
  const rsc = { headers: new Headers({ accept: "*/*" }) };

  it("merges an existing Vary instead of replacing it", () => {
    const response = applyResponsePolicy(page, answer({ vary: "Cookie" }), {
      hasMarkdownTwin: true,
    });

    expect(response.headers.get("vary")).toBe(
      "Cookie, rsc, next-router-state-tree, next-router-prefetch, next-router-segment-prefetch, Accept",
    );
  });

  it("gives documents the short policy and RSC payloads no storage", () => {
    expect(
      applyResponsePolicy(page, answer(), {
        hasMarkdownTwin: false,
      }).headers.get("cache-control"),
    ).toBe(DOCUMENT_CACHE_CONTROL);
    expect(
      applyResponsePolicy(rsc, answer(), {
        hasMarkdownTwin: false,
      }).headers.get("cache-control"),
    ).toBe(UNCACHED);
  });

  it("never stores a redirect", () => {
    const response = applyResponsePolicy(page, answer({ location: "/docs" }), {
      hasMarkdownTwin: false,
    });

    expect(response.headers.get("cache-control")).toBe(UNCACHED);
  });

  it("leaves the markdown twin's own Cache-Control alone", () => {
    const response = applyResponsePolicy(page, answer(), {
      hasMarkdownTwin: true,
      isMarkdownTwin: true,
    });

    expect(response.headers.get("cache-control")).toBeNull();
    expect(response.headers.get("vary")).toContain("Accept");
  });

  it("documents get no long shared cache or long stale window", () => {
    const sMaxAge = Number(/s-maxage=(\d+)/.exec(DOCUMENT_CACHE_CONTROL)?.[1]);
    const swr = Number(
      /stale-while-revalidate=(\d+)/.exec(DOCUMENT_CACHE_CONTROL)?.[1],
    );

    expect(DOCUMENT_CACHE_CONTROL).toMatch(/max-age=0\b/);
    expect(sMaxAge).toBeLessThanOrEqual(300);
    expect(swr).toBeLessThanOrEqual(60);
  });
});
