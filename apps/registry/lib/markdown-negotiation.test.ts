import { describe, expect, it } from "vitest";

import {
  markdownPathname,
  markdownPathnames,
  markdownTarget,
  prefersMarkdown,
} from "@/lib/markdown-negotiation";

describe("prefersMarkdown", () => {
  it("accepts a client that asks for markdown by name", () => {
    expect(prefersMarkdown("text/markdown")).toBe(true);
    expect(prefersMarkdown("text/markdown, text/html;q=0.9")).toBe(true);
    expect(prefersMarkdown("text/html;q=0.5, text/markdown")).toBe(true);
  });

  it("never selects markdown for a browser or an anonymous client", () => {
    expect(
      prefersMarkdown(
        "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      ),
    ).toBe(false);
    expect(prefersMarkdown("*/*")).toBe(false);
    expect(prefersMarkdown("")).toBe(false);
    expect(prefersMarkdown(new Headers().get("accept"))).toBe(false);
  });

  it("keeps HTML when the client ranks it above markdown", () => {
    expect(prefersMarkdown("text/html, text/markdown;q=0.5")).toBe(false);
    expect(prefersMarkdown("text/markdown;q=0, text/html")).toBe(false);
  });

  it("treats an equal weight as a request for markdown", () => {
    expect(prefersMarkdown("text/html, text/markdown")).toBe(true);
  });

  it("ignores case and a malformed weight", () => {
    expect(prefersMarkdown("Text/Markdown")).toBe(true);
    expect(prefersMarkdown("text/markdown;q=abc")).toBe(false);
  });
});

describe("markdownTarget", () => {
  it("finds the pages that have authored markdown behind them", () => {
    expect(markdownTarget("/")).toEqual({ kind: "home" });
    expect(markdownTarget("/design")).toEqual({ kind: "design" });
    expect(markdownTarget("/philosophy")).toEqual({ kind: "philosophy" });
    expect(markdownTarget("/docs/cli")).toEqual({ kind: "docs", slug: "cli" });
    expect(markdownTarget("/components/button")).toEqual({
      kind: "component",
      slug: "button",
    });
  });

  it("has no twin for a page assembled at render time or an unknown slug", () => {
    expect(markdownTarget("/docs/changelog")).toBeUndefined();
    expect(markdownTarget("/docs/not-a-page")).toBeUndefined();
    expect(markdownTarget("/components/not-a-component")).toBeUndefined();
    expect(markdownTarget("/components")).toBeUndefined();
    expect(markdownTarget("/templates")).toBeUndefined();
    expect(markdownTarget("/docs/cli/extra")).toBeUndefined();
  });
});

describe("markdownPathname", () => {
  it("maps a public pathname to the internal route for its locale", () => {
    expect(markdownPathname("/")).toBe("/md/en");
    expect(markdownPathname("/docs/cli")).toBe("/md/en/docs/cli");
    expect(markdownPathname("/fr")).toBe("/md/fr");
    expect(markdownPathname("/fr/components/button")).toBe(
      "/md/fr/components/button",
    );
  });

  it("returns nothing for a page without a twin", () => {
    expect(markdownPathname("/templates")).toBeUndefined();
    expect(markdownPathname("/fr/docs/changelog")).toBeUndefined();
    expect(markdownPathname("/p/native/components/button")).toBeUndefined();
  });
});

describe("markdownPathnames", () => {
  it("lists exactly the pathnames markdownTarget accepts", () => {
    const pathnames = markdownPathnames();

    expect(new Set(pathnames).size).toBe(pathnames.length);
    expect(pathnames.filter((pathname) => !markdownTarget(pathname))).toEqual(
      [],
    );
  });
});
