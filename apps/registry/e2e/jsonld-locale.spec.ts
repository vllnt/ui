import { expect, type Page, test } from "@playwright/test";

/**
 * Regression guard for the locale-JSON-LD bug (page-level).
 *
 * Page structured-data URLs were built from `${SITE_URL}${pathname}` with no
 * locale segment, so a /fr page emitted English URLs that mismatched its own
 * canonical. This asserts the rendered breadcrumb JSON-LD on a real page: a
 * non-default locale route prefixes its URLs with the locale, the default
 * locale route does not. Catches a page that bypasses breadcrumbTrailLd and
 * hand-builds URLs again. Uses /families/[category] because its JSON-LD is a
 * plain server-rendered <script>. Playwright text engines ignore <script>
 * content, so the block is read via allTextContents and matched in JS.
 */
async function breadcrumbJson(page: Page, path: string): Promise<string> {
  await page.goto(path);
  let block = "";
  await expect
    .poll(
      async () => {
        const blocks = await page
          .locator('script[type="application/ld+json"]')
          .allTextContents();
        block =
          blocks.find((text) => text.includes('"@type":"BreadcrumbList"')) ??
          "";
        return block.length;
      },
      { timeout: 10_000 },
    )
    .toBeGreaterThan(0);
  return block;
}

test.describe("locale-aware JSON-LD", () => {
  test("a /fr route prefixes its breadcrumb URLs with the locale", async ({
    page,
  }) => {
    const json = await breadcrumbJson(page, "/fr/families/form");

    // Home crumb resolves to the /fr root, the family crumb to /fr/families/form.
    expect(json).toMatch(/"item":"https:\/\/[^"]*\/fr","name":"Home"/);
    expect(json).toMatch(/"item":"https:\/\/[^"]*\/fr\/families\/form"/);
  });

  test("the default-locale route carries no locale segment", async ({
    page,
  }) => {
    const json = await breadcrumbJson(page, "/families/form");

    expect(json).not.toContain("/fr");
    expect(json).toMatch(/"item":"https:\/\/[^"]*\/families\/form"/);
  });
});
