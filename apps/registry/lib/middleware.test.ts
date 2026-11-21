import { NextRequest } from "next/server";
import { describe, expect, it } from "vitest";

import middleware from "@/middleware";

import { DOCUMENT_CACHE_CONTROL, UNCACHED } from "./response-policy";

const ORIGIN = "https://ui.vllnt.com";
const ROUTER_VARY = [
  "rsc",
  "next-router-state-tree",
  "next-router-prefetch",
  "next-router-segment-prefetch",
];
/** A browser page load. */
const PAGE_HEADERS = {
  accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
};
/**
 * What the middleware sees of a router fetch: Next strips `rsc` and the
 * `next-router-*` headers before the middleware runs, and the fetch sends no
 * `Accept` of its own.
 */
const RSC_HEADERS = { accept: "*/*" };
const PREFETCH_HEADERS = {};

function call(path: string, headers: Record<string, string> = {}) {
  return middleware(
    new NextRequest(new URL(path, ORIGIN), {
      headers: { host: "ui.vllnt.com", ...headers },
    }),
  );
}

function varyOf(response: Response): string[] {
  return (response.headers.get("vary") ?? "")
    .split(",")
    .map((name) => name.trim().toLowerCase())
    .filter(Boolean);
}

/** Every middleware redirect, with and without the client router's headers. */
const REDIRECTS: readonly { from: string; to: string }[] = [
  { from: "/en/docs", to: "/docs" },
  { from: "/docs/native", to: "/docs/installation?platform=native" },
  {
    from: "/p/native/components/button",
    to: "/components/button?platform=native",
  },
  { from: "/design.md", to: "/DESIGN.md" },
  { from: "/philosophy", to: "/vision" },
  { from: "/fr/docs/vision", to: "/fr/vision" },
];

const REQUEST_KINDS = [
  { headers: PAGE_HEADERS, label: "a page load" },
  { headers: RSC_HEADERS, label: "an RSC navigation" },
  { headers: PREFETCH_HEADERS, label: "an RSC prefetch" },
] as const;

const REDIRECT_CASES = REDIRECTS.flatMap((redirect) =>
  REQUEST_KINDS.map((kind) => ({ ...redirect, ...kind })),
);

describe("middleware redirects", () => {
  it.each(REDIRECT_CASES)(
    "$from redirects $label to $to, uncached, with the router Vary",
    ({ from, headers, to }) => {
      const response = call(from, headers);
      const location = new URL(response.headers.get("location") ?? "", ORIGIN);

      expect(response.status).toBeGreaterThanOrEqual(300);
      expect(response.status).toBeLessThan(400);
      expect(`${location.pathname}${location.search}`).toBe(to);
      expect(response.headers.get("cache-control")).toBe(UNCACHED);
      expect(varyOf(response)).toEqual(expect.arrayContaining(ROUTER_VARY));
    },
  );

  it.each([
    { from: "/en", to: "/" },
    { from: "/en/docs/cli", to: "/docs/cli" },
    {
      from: "/en/components?platform=native",
      to: "/components?platform=native",
    },
  ])(
    "sends the prefixed default locale $from permanently to $to without a cookie",
    ({ from, to }) => {
      const response = call(from, PAGE_HEADERS);
      const location = new URL(response.headers.get("location") ?? "", ORIGIN);

      expect(response.status).toBe(308);
      expect(`${location.pathname}${location.search}`).toBe(to);
      expect(response.headers.get("set-cookie")).toBeNull();
    },
  );

  it.each([
    { from: "/philosophy", to: "/vision" },
    { from: "/fr/philosophy", to: "/fr/vision" },
    { from: "/docs/vision", to: "/vision" },
    { from: "/fr/docs/vision", to: "/fr/vision" },
    { from: "/en/philosophy", to: "/vision" },
    { from: "/en/docs/vision", to: "/vision" },
  ])(
    "sends the merged page $from permanently to $to without a cookie",
    ({ from, to }) => {
      const response = call(from, PAGE_HEADERS);
      const location = new URL(response.headers.get("location") ?? "", ORIGIN);

      expect(response.status).toBe(308);
      expect(location.pathname).toBe(to);
      expect(response.headers.get("set-cookie")).toBeNull();
    },
  );

  it("keeps the query on a merged page", () => {
    const response = call("/philosophy?ref=nav");

    expect(response.status).toBe(308);
    expect(response.headers.get("location")).toBe(`${ORIGIN}/vision?ref=nav`);
  });

  it("redirects a merged page before it can answer as markdown", () => {
    const response = call("/docs/vision", { accept: "text/markdown" });

    expect(response.status).toBe(308);
    expect(
      new URL(response.headers.get("location") ?? "", ORIGIN).pathname,
    ).toBe("/vision");
    expect(response.headers.get("x-middleware-rewrite")).toBeNull();
  });

  it.each([
    "/Philosophy",
    "/DOCS/VISION",
    "/docs/vision/extra",
    "/philosophy-x",
  ])("does not redirect %s: the match is exact and case-sensitive", (path) => {
    const response = call(path, PAGE_HEADERS);

    expect(response.headers.get("location")).toBeNull();
  });

  it("keeps the query of the request on a moved page", () => {
    const response = call("/p/native/components/button?tab=code");

    expect(response.headers.get("location")).toBe(
      `${ORIGIN}/components/button?tab=code&platform=native`,
    );
  });

  it("a locale redirect from a language cookie is uncached and says it varies", () => {
    const response = call("/docs", { cookie: "NEXT_LOCALE=fr" });

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toMatch(/\/fr\/docs$/);
    expect(response.headers.get("cache-control")).toBe(UNCACHED);
    expect(varyOf(response)).toEqual(
      expect.arrayContaining([...ROUTER_VARY, "accept"]),
    );
    expect(response.headers.get("set-cookie")).toBeNull();
  });

  it("a legacy host redirect is uncached too", () => {
    const response = middleware(
      new NextRequest(new URL("/docs", "https://ui.vllnt.ai"), {
        headers: { host: "ui.vllnt.ai" },
      }),
    );

    expect(response.status).toBe(301);
    expect(response.headers.get("cache-control")).toBe(UNCACHED);
  });
});

describe("middleware pages", () => {
  it("gives a page the short document policy and Accept in Vary when it has a markdown twin", () => {
    const response = call("/docs", PAGE_HEADERS);

    expect(response.headers.get("location")).toBeNull();
    expect(response.headers.get("cache-control")).toBe(DOCUMENT_CACHE_CONTROL);
    expect(varyOf(response)).toEqual([...ROUTER_VARY, "accept"]);
  });

  it("leaves Accept out of Vary on a page without a markdown twin", () => {
    const response = call("/templates");

    expect(varyOf(response)).toEqual(ROUTER_VARY);
  });

  it.each([RSC_HEADERS, PREFETCH_HEADERS])(
    "never lets an RSC payload be stored (%o)",
    (headers) => {
      const response = call("/docs", headers);

      expect(response.headers.get("cache-control")).toBe(UNCACHED);
      expect(varyOf(response)).toEqual(expect.arrayContaining(ROUTER_VARY));
    },
  );

  it("covers a platform variant rewrite", () => {
    const response = call("/components/button?platform=native", PAGE_HEADERS);

    expect(response.headers.get("x-middleware-rewrite")).toContain(
      "/p/native/components/button",
    );
    expect(response.headers.get("cache-control")).toBe(DOCUMENT_CACHE_CONTROL);
  });

  it("covers preview embeds, which skip the locale logic", () => {
    const response = call("/embed/button", PAGE_HEADERS);

    expect(response.headers.get("x-middleware-next")).toBe("1");
    expect(response.headers.get("cache-control")).toBe(DOCUMENT_CACHE_CONTROL);
  });

  it("sets no cookie on a page", () => {
    const response = call("/fr/docs", { "accept-language": "en" });

    expect(response.headers.get("set-cookie")).toBeNull();
    expect(response.headers.get("x-middleware-set-cookie")).toBeNull();
  });
});

describe("middleware markdown twin", () => {
  it.each([
    { path: "/vision", rewrite: "/md/en/vision" },
    { path: "/fr/vision", rewrite: "/md/fr/vision" },
  ])("answers markdown for $path with the Vision page", ({ path, rewrite }) => {
    const response = call(path, { accept: "text/markdown" });

    expect(response.headers.get("x-middleware-rewrite")).toBe(
      `${ORIGIN}${rewrite}`,
    );
  });

  it("answers markdown with Accept and the router headers in Vary, and keeps the route's own caching", () => {
    const response = call("/docs", { accept: "text/markdown" });

    expect(response.headers.get("x-middleware-rewrite")).toBe(
      `${ORIGIN}/md/en/docs`,
    );
    expect(varyOf(response)).toEqual([...ROUTER_VARY, "accept"]);
    expect(response.headers.get("cache-control")).toBeNull();
  });
});
