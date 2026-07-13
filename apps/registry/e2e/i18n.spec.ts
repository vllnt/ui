import { expect, type Page, test } from "@playwright/test";

/**
 * i18n end-to-end coverage. Verifies that the whole route surface is genuinely
 * bilingual: every route resolves in both locales, advertises the correct
 * `<html lang>` and hreflang alternates, the language switcher round-trips while
 * preserving the path, and the French routes render real French (not an English
 * fallback). Complements scripts/check-i18n.ts (static parity) with runtime proof.
 */

const ROUTES = [
  "/",
  "/components",
  "/components/button",
  "/families",
  "/families/ai",
  "/docs",
  "/docs/installation",
  "/docs/theming",
  "/philosophy",
  "/templates",
  "/themes",
  "/design",
  "/vs",
  "/vs/shadcn",
  "/ai",
  "/releases",
  "/changelog",
  "/request-component",
  "/report",
] as const;

/**
 * Off-Vercel analytics/speed-insights scripts 404 on this platform (expected
 * noise). Resource-load failures surface as a generic "Failed to load resource"
 * console error whose URL lives in location(), not text() — so match both the
 * known hosts and the generic resource-load message. Real app errors (uncaught
 * exceptions via pageerror, next-intl MISSING_MESSAGE) are unaffected.
 */
const IGNORED_CONSOLE = [
  "vercel",
  "va.vercel-scripts",
  "speed-insights",
  "_vercel/insights",
  "favicon",
  "failed to load resource",
];

function frPath(route: string): string {
  return route === "/" ? "/fr" : `/fr${route}`;
}

function collectConsoleErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on("console", (message) => {
    if (message.type() !== "error") return;
    const text = message.text().toLowerCase();
    if (IGNORED_CONSOLE.some((needle) => text.includes(needle))) return;
    errors.push(message.text());
  });
  page.on("pageerror", (error) => errors.push(error.message));
  return errors;
}

test.describe("i18n route coverage", () => {
  for (const route of ROUTES) {
    test(`en ${route} renders lang=en with hreflang alternates`, async ({
      page,
    }) => {
      // Cold `next dev` compiles heavy routes on demand; give them headroom.
      test.slow();
      const response = await page.goto(route);
      expect(response?.status(), `status for ${route}`).toBeLessThan(400);
      await expect(page.locator("html")).toHaveAttribute("lang", "en");
      // Generous timeout + document-wide selector: under `next dev` a cold,
      // heavy route compiles on demand and streams its metadata after first
      // paint (prod prebuilds it into <head> — verified separately).
      await expect(page.locator('link[hreflang="fr"]')).toHaveCount(1, {
        timeout: 20_000,
      });
      await expect(page.locator('link[hreflang="x-default"]')).toHaveCount(1, {
        timeout: 20_000,
      });
    });

    test(`fr ${frPath(route)} renders lang=fr`, async ({ page }) => {
      const errors = collectConsoleErrors(page);
      const response = await page.goto(frPath(route));
      expect(response?.status(), `status for ${frPath(route)}`).toBeLessThan(
        400,
      );
      await expect(page.locator("html")).toHaveAttribute("lang", "fr");
      expect(errors, `console errors on ${frPath(route)}`).toEqual([]);
    });
  }
});

test.describe("i18n language switcher", () => {
  test("switches en -> fr and preserves the path", async ({ page, baseURL }) => {
    await page.goto("/components");
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
    await page
      .getByRole("link", { name: "fr", exact: true })
      .first()
      .click();
    await page.waitForURL(`${baseURL}/fr/components`);
    await expect(page.locator("html")).toHaveAttribute("lang", "fr");
  });

  test("switches fr -> en back to the unprefixed path", async ({
    page,
    baseURL,
  }) => {
    await page.goto("/fr/components");
    await expect(page.locator("html")).toHaveAttribute("lang", "fr");
    await page
      .getByRole("link", { name: "en", exact: true })
      .first()
      .click();
    await page.waitForURL(`${baseURL}/components`);
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
  });
});

test.describe("i18n renders real French", () => {
  test("home hero + footer are French", async ({ page }) => {
    await page.goto("/fr");
    await expect(
      page.getByText("Le systeme de design UI pour les agents IA."),
    ).toBeVisible();
    // Footer column title from the `footer` namespace.
    await expect(page.getByText("Bibliotheque", { exact: true })).toBeVisible();
  });

  test("docs sub-page is French, not an English fallback", async ({
    page,
  }) => {
    await page.goto("/docs/theming");
    const english = (await page.locator("main").innerText()).trim();
    await page.goto("/fr/docs/theming");
    const french = (await page.locator("main").innerText()).trim();
    expect(french.length).toBeGreaterThan(0);
    expect(french).not.toEqual(english);
  });
});
