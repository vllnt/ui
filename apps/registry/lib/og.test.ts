import { describe, expect, it, vi } from "vitest";

// @/i18n/routing pulls next-intl/navigation, which cannot load in the node
// test environment; the module under test needs nothing beyond locale constants.
vi.mock("@/i18n/routing", () => ({
  routing: { defaultLocale: "en", locales: ["en", "fr"] },
}));

import { generateTwitterMetadata } from "./og";

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
