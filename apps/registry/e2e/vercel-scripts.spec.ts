import { expect, test } from "@playwright/test";

/**
 * The site is self-hosted. Vercel serves its analytics scripts only on its own
 * platform, so off Vercel every page that requests them gets two 404s.
 */
test("pages request no Vercel-only scripts off Vercel", async ({ page }) => {
  // The scripts are injected after hydration; give that time to happen.
  const vercelScript = page
    .waitForRequest(
      (request) =>
        request.url().includes("/_vercel/") ||
        request.url().includes("va.vercel-scripts.com"),
      { timeout: 15_000 },
    )
    .then(
      (request) => request.url(),
      () => null,
    );

  await page.goto("/");

  expect(await vercelScript).toBeNull();
});
