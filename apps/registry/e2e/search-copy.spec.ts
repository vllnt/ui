import { expect, test } from "@playwright/test";

import { listSearchCopy } from "../lib/search-copy";

const NOT_YET_LIVE = new Set(["/docs/vision"]);

test.describe("search copy rewrites", () => {
  for (const [pathname, copy] of listSearchCopy()) {
    if (NOT_YET_LIVE.has(pathname)) continue;

    test(`${pathname} emits its row as the title and description`, async ({
      page,
    }) => {
      await page.goto(pathname);

      await expect(page).toHaveTitle(copy.title);
      await expect(page.locator('meta[name="description"]')).toHaveAttribute(
        "content",
        copy.description,
      );
    });
  }

  test("a non-default locale keeps its own title", async ({ page }) => {
    await page.goto("/fr/design");

    await expect(page).not.toHaveTitle(/vllnt UI$/);
  });
});
