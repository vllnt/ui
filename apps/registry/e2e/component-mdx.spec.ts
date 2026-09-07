import { expect, test } from "@playwright/test";

/**
 * Per-component SEO MDX renders server-side (crawlable prose) and embeds the
 * live kit (`<Preview>` etc.). Verifies both locales render their own authored
 * content, not a shared shell.
 */
test.describe("component SEO MDX", () => {
  test("en /components/button renders authored prose + live preview", async ({
    page,
  }) => {
    await page.goto("/components/button");
    await expect(
      page.getByText("primary interactive control", { exact: false }),
    ).toBeVisible();
    // The <Preview/> kit renders the playground tabs (a real interactive block).
    await expect(page.locator("iframe, canvas, [role=tablist]").first()).toBeVisible();
  });

  test("fr /fr/components/button renders French prose (not English)", async ({
    page,
  }) => {
    await page.goto("/fr/components/button");
    await expect(page.locator("html")).toHaveAttribute("lang", "fr");
    await expect(
      page.getByText("controle interactif principal", { exact: false }),
    ).toBeVisible();
    await expect(
      page.getByText("primary interactive control", { exact: false }),
    ).toHaveCount(0);
  });
});
