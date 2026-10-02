import { describe, expect, it, vi } from "vitest";

vi.mock("@/i18n/routing", () => ({
  routing: { defaultLocale: "en", locales: ["en", "fr"] },
}));

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
    await Promise.all(
      routing.locales.map(async (locale) => {
        const guides = await getGuides(locale);
        expect(guides).toHaveLength(3);
        await Promise.all(
          guides.map(async (guide) => {
            const page = await getGuideContent(guide.slug, locale);
            expect(page?.locale).toBe(locale);
            expect(page?.frontmatter.title).toBe(guide.title);
            expect(page?.content.length).toBeGreaterThan(1500);
            if (locale === "fr")
              expect(page?.content).not.toMatch(/[\u00C0-\u017F]/);
          }),
        );
      }),
    );
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
