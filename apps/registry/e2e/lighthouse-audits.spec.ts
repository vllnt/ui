import { createRequire } from "node:module";

import { expect, test } from "@playwright/test";

/**
 * Lighthouse audits that once failed on the live site, checked on the pages
 * where they failed. Lighthouse runs the same axe rules, in both color schemes.
 */

type AxeWindow = {
  axe: {
    run: (
      context: Document,
      options: object,
    ) => Promise<{
      violations: { id: string; nodes: { target: unknown }[] }[];
    }>;
  };
};

const axeScriptPath = createRequire(import.meta.url).resolve(
  "axe-core/axe.min.js",
);

const AXE_PAGES = ["/vs", "/fr/vs", "/articles", "/themes"] as const;
const AXE_RULES = ["color-contrast", "heading-order"];

for (const colorScheme of ["light", "dark"] as const) {
  test.describe(`Lighthouse accessibility audits, ${colorScheme}`, () => {
    test.use({ colorScheme });

    for (const path of AXE_PAGES) {
      test(`${path} passes ${AXE_RULES.join(" and ")}`, async ({ page }) => {
        await page.goto(path);
        await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
        await page.addScriptTag({ path: axeScriptPath });

        const { violations } = await page.evaluate(
          (rules) =>
            (window as unknown as AxeWindow).axe.run(document, {
              runOnly: { type: "rule", values: rules },
            }),
          AXE_RULES,
        );

        expect(
          violations.map(({ id, nodes }) => ({
            id,
            targets: nodes.map((node) => node.target),
          })),
        ).toEqual([]);
      });
    }
  });
}

/** Search engines may index the request and report pages (26 Nov 2026). */
const INDEXABLE_PAGES = [
  "/request-component",
  "/fr/request-component",
  "/report",
  "/fr/report",
] as const;

test.describe("indexable form pages", () => {
  for (const path of INDEXABLE_PAGES) {
    test(`${path} is not marked noindex`, async ({ page }) => {
      await page.goto(path);

      const robots = await page
        .locator('meta[name="robots"]')
        .evaluateAll((tags) => tags.map((tag) => tag.getAttribute("content")));
      expect(robots.filter((content) => content?.includes("noindex"))).toEqual(
        [],
      );
    });
  }
});

/**
 * A page can have no `h2` of its own (the articles index with no published
 * article), so footer column titles must be `h2` to keep the heading order.
 */
test("footer column titles do not skip a heading level", async ({ page }) => {
  await page.goto("/articles");
  // The shared shell renders the footer after <main>, in the page's own footer.
  const footer = page.locator("footer").last();

  await expect(footer.getByRole("heading", { level: 2 }).first()).toBeVisible();
  await expect(footer.getByRole("heading", { level: 3 })).toHaveCount(0);
});
