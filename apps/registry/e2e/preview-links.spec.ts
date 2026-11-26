import { expect, test } from "@playwright/test";

/**
 * Every gallery thumbnail is a live preview in an iframe, so Next.js prefetches
 * each `next/link` link it shows. A demo link to a page that does not exist
 * turns every gallery visit into a burst of 404s, which the production edge
 * reads as probing and bans. These previews render `next/link` links, so each
 * link must reach a real page. Point a new demo link at an existing page such
 * as `/components` or `/articles`.
 */
const PREVIEWS_WITH_LINKS = [
  "blog-card",
  "breadcrumb",
  "category-filter",
  "pagination",
] as const;

test.describe("preview demo links", () => {
  for (const slug of PREVIEWS_WITH_LINKS) {
    test(`the ${slug} preview links only to pages that exist`, async ({
      page,
      request,
    }) => {
      await page.goto(`/embed/${slug}?mode=thumbnail`);
      const hrefs = await page
        .locator("a[href^='/']")
        .evaluateAll((links) => [
          ...new Set(links.map((link) => link.getAttribute("href") ?? "")),
        ]);

      expect(hrefs.length).toBeGreaterThan(0);
      const statuses = await Promise.all(
        hrefs.map(async (href) => ({
          href,
          status: (await request.get(href)).status(),
        })),
      );
      expect(statuses.filter(({ status }) => status >= 400)).toEqual([]);
    });
  }
});
