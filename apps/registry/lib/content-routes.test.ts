import { describe, expect, it } from "vitest";

import { routing } from "@/i18n/routing";
import {
  getGuideContent,
  getGuides,
  getGuideSlugs,
} from "@/lib/content-routes";

describe("guide content routes", () => {
  it("discovers sorted guides with content in every locale", async () => {
    expect(await getGuideSlugs()).toEqual([
      "ai-ui",
      "design-tokens",
      "streaming-ui",
    ]);
    for (const locale of routing.locales) {
      const guides = await getGuides(locale);
      expect(guides).toHaveLength(3);
      for (const guide of guides) {
        const page = await getGuideContent(guide.slug, locale);
        expect(page?.locale).toBe(locale);
        expect(page?.frontmatter.title).toBe(guide.title);
        expect(page?.content.length).toBeGreaterThan(1500);
        if (locale === "fr")
          expect(page?.content).not.toMatch(/[\u00C0-\u017F]/);
      }
    }
  });

  it.each([
    "missing",
    "../docs/installation",
    "ai-ui/../../docs",
    "%2e%2e",
    "/ai-ui",
    "AI-UI",
    "ai-ui\\..\\docs",
  ])("rejects unknown or unsafe slug %s", async (slug) => {
    expect(await getGuideContent(slug, "en")).toBeUndefined();
  });
});
