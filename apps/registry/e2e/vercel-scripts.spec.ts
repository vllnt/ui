import { expect, type Request, test } from "@playwright/test";

/**
 * The site is self-hosted. Vercel serves its analytics scripts only on its own
 * platform, so off Vercel every page that requests them gets two 404s.
 */
function isVercelScript(request: Request): boolean {
  const url = new URL(request.url());
  return (
    url.pathname.startsWith("/_vercel/") ||
    url.hostname === "va.vercel-scripts.com"
  );
}

test("pages request no Vercel-only scripts off Vercel", async ({ page }) => {
  const requested: string[] = [];
  page.on("request", (request) => {
    if (isVercelScript(request)) requested.push(request.url());
  });

  const response = await page.goto("/");
  expect(response?.ok()).toBe(true);
  // The scripts are injected after hydration, which can end after `load`.
  await page
    .waitForRequest(isVercelScript, { timeout: 10_000 })
    .catch(() => undefined);

  expect(requested).toEqual([]);
});
