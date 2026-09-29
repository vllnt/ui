import { describe, expect, it, vi } from "vitest";

// @/i18n/routing pulls next-intl/navigation, which cannot load in the node
// test environment; the module under test needs nothing beyond locale constants.
vi.mock("@/i18n/routing", () => ({
  routing: { defaultLocale: "en", locales: ["en", "fr"] },
}));

import {
  frontmatterPageMetadata,
  generateTwitterMetadata,
  pageMetadata,
} from "./og";

describe("pageMetadata", () => {
  it("defaults the page title/description to the social card and localizes URLs", () => {
    const metadata = pageMetadata({
      locale: "fr",
      og: { description: "Desc", title: "Title", type: "page" },
      pathname: "/themes",
    });

    expect(metadata).toMatchObject({
      alternates: {
        canonical: "https://ui.vllnt.com/fr/themes",
        languages: {
          en: "https://ui.vllnt.com/themes",
          fr: "https://ui.vllnt.com/fr/themes",
        },
      },
      description: "Desc",
      openGraph: { title: "Title", url: "https://ui.vllnt.com/fr/themes" },
      title: "Title",
      twitter: { description: "Desc", title: "Title" },
    });
  });

  it("keeps explicit fields, merges alternates, and canonicalizes to canonicalPath", () => {
    const metadata = pageMetadata({
      alternates: { types: { rss: "/rss.xml" } },
      canonicalPath: "/components/button",
      locale: "en",
      og: { title: "Button", type: "component" },
      pathname: "/components/button/playground",
      robots: { follow: true, index: false },
      title: "Button playground",
    });

    expect(metadata).toMatchObject({
      alternates: {
        canonical: "https://ui.vllnt.com/components/button",
        types: { rss: "/rss.xml" },
      },
      openGraph: { url: "https://ui.vllnt.com/components/button/playground" },
      robots: { follow: true, index: false },
      title: "Button playground",
    });
  });
});

describe("frontmatterPageMetadata", () => {
  it("lets og frontmatter override only the social card", () => {
    const metadata = frontmatterPageMetadata(
      {
        description: "Page desc",
        og: { title: "Social title" },
        title: "Page title",
        type: "docs",
      },
      { locale: "en", pathname: "/docs" },
    );

    expect(metadata).toMatchObject({
      description: "Page desc",
      openGraph: { description: "Page desc", title: "Social title" },
      title: "Page title",
    });
  });
});

describe("generateTwitterMetadata", () => {
  it("keeps the site-wide attribution that pages lose when they override the layout twitter metadata", () => {
    const twitter = generateTwitterMetadata({
      description: "Honest comparison.",
      title: "VLLNT UI vs shadcn/ui",
      type: "page",
    });

    expect(twitter).toMatchObject({
      card: "summary_large_image",
      creator: "@vllnt",
      site: "@vllnt",
    });
  });

  it("returns an /api/og image for the given parameters", () => {
    const twitter = generateTwitterMetadata({
      title: "Report a bug",
      type: "page",
    });

    const images = twitter && "images" in twitter ? twitter.images : undefined;
    expect(images).toEqual([
      expect.stringContaining("/api/og?title=Report+a+bug"),
    ]);
  });
});
