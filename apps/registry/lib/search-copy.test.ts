import { describe, expect, it } from "vitest";

import { AI_SEO } from "./ai-seo";
import { COMPONENT_SEO } from "./component-seo";
import { pageMetadata } from "./og";
import {
  getSearchCopy,
  listSearchCopy,
  searchCopyFor,
  type SearchCopyPath,
} from "./search-copy";

const EXPECTED_PATHS: readonly SearchCopyPath[] = [
  "/",
  "/build/ai-chat-ui",
  "/build/tool-calls-agent-steps",
  "/components/ai-tool-call-display",
  "/components/cookie-consent",
  "/components/floating-navbar",
  "/components/gantt-chart",
  "/components/glass-card",
  "/components/globe-3d",
  "/components/liquid-glass",
  "/components/scroll-area",
  "/components/sidebar",
  "/components/timeline-scrubber",
  "/components?platform=native",
  "/design",
  "/docs/agents",
  "/docs/theming",
  "/docs/vision",
  "/families/ai",
  "/themes",
  "/vs/vercel-ai-sdk",
];

const EM_DASH = String.fromCodePoint(0x20_14);

describe("search copy table", () => {
  it("has a row for every page of the rewrite plan", () => {
    expect(listSearchCopy().map(([pathname]) => pathname)).toEqual(
      expect.arrayContaining([...EXPECTED_PATHS]),
    );
    expect(listSearchCopy()).toHaveLength(EXPECTED_PATHS.length);
  });

  it.each(listSearchCopy())(
    "%s fits a result snippet and carries the brand suffix",
    (_pathname, copy) => {
      expect(copy.title.endsWith(" | vllnt UI")).toBe(true);
      expect(copy.title.length).toBeLessThanOrEqual(60);
      expect(copy.description.length).toBeLessThanOrEqual(160);
      expect(copy.description.length).toBeGreaterThan(100);
      expect(copy.title + copy.description).not.toContain(EM_DASH);
    },
  );

  it("is used on the default locale only", () => {
    expect(getSearchCopy("/design", "en")).toBe(searchCopyFor("/design"));
    expect(getSearchCopy("/design", "fr")).toBeUndefined();
    expect(getSearchCopy("/no-such-page", "en")).toBeUndefined();
  });
});

describe("pageMetadata with search copy", () => {
  const og = {
    description: "The page's own description.",
    title: "The page's own title",
    type: "page",
  } as const;

  it("replaces the title and description of a page with a row, on the default locale", () => {
    const metadata = pageMetadata({
      locale: "en",
      og,
      pathname: "/design",
      title: "Design Guide",
    });
    const row = searchCopyFor("/design");

    expect(metadata.title).toBe(row.title);
    expect(metadata.description).toBe(row.description);
    expect(metadata.openGraph?.title).toBe(og.title);
    expect(metadata.twitter?.title).toBe(og.title);
    expect(metadata.alternates?.canonical).toBe("https://ui.vllnt.com/design");
  });

  it("keeps the page's own copy on another locale", () => {
    const metadata = pageMetadata({
      locale: "fr",
      og,
      pathname: "/design",
      title: "Design Guide",
    });

    expect(metadata.title).toBe("Design Guide");
    expect(metadata.description).toBe(og.description);
  });

  it("leaves a page without a row alone", () => {
    const metadata = pageMetadata({
      locale: "en",
      og,
      pathname: "/philosophy",
    });

    expect(metadata.title).toBe(og.title);
    expect(metadata.description).toBe(og.description);
  });

  it("gives a native-capable component page its row as written", () => {
    const metadata = pageMetadata({
      description: "A description wrapped by the native notice.",
      locale: "en",
      og: { ...og, title: "Sidebar for React and React Native" },
      pathname: "/components/sidebar",
      title: "Sidebar for React and React Native",
    });
    const row = searchCopyFor("/components/sidebar");

    expect(metadata.title).toBe(row.title);
    expect(metadata.description).toBe(row.description);
  });
});

describe("hand-written entries that share a row", () => {
  it.each([
    "/components/gantt-chart",
    "/components/timeline-scrubber",
  ] as const)("component-seo %s is written once, in the table", (pathname) => {
    const slug = pathname.replace("/components/", "");
    const entry = COMPONENT_SEO.find((candidate) => candidate.slug === slug);

    expect(entry?.title).toBe(searchCopyFor(pathname).title);
    expect(entry?.description).toBe(searchCopyFor(pathname).description);
  });

  it("ai-seo ai-tool-call-display is written once, in the table", () => {
    const entry = AI_SEO.find(
      (candidate) => candidate.slug === "ai-tool-call-display",
    );
    const row = searchCopyFor("/components/ai-tool-call-display");

    expect(entry?.title).toBe(row.title);
    expect(entry?.description).toBe(row.description);
  });
});
