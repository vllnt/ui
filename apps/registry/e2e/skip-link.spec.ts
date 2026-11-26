import { expect, test } from "@playwright/test";

/**
 * The header's "Skip to content" link points at `#main`, so every page needs
 * exactly one element with that id. Lighthouse fails the `skip-link` audit
 * without it. Give a new page's `<main>` the id `main` (PageShell already does).
 */
const ROUTES = [
  "/",
  "/components",
  "/components/button",
  "/components/button/playground",
  "/families/ai",
  "/docs",
  "/docs/installation",
  "/templates",
  "/templates/next-starter",
  "/themes",
  "/vision",
  "/ai",
  "/fr/docs",
] as const;

test.describe("skip link target", () => {
  for (const route of ROUTES) {
    test(`${route} has one #main for the skip link`, async ({ page }) => {
      await page.goto(route);

      await expect(page.locator('a[href="#main"]')).toHaveCount(1);
      await expect(page.locator("#main")).toHaveCount(1);
      await expect(page.locator("main#main")).toHaveCount(1);
    });
  }
});
