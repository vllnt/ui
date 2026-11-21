import { createRequire } from "node:module";

import { expect, type Page, test } from "@playwright/test";

/**
 * Vision is one page, at /vision and /fr/vision. The Philosophy page and the
 * docs Vision article merged into it, so their four old URLs answer with a
 * permanent redirect, and no link on the site points at them any more.
 */

declare global {
  interface Window {
    axe: {
      run: (
        context: Document,
        options: object,
      ) => Promise<{
        violations: { help: string; id: string; nodes: unknown[] }[];
      }>;
    };
  }
}

const axeScriptPath = createRequire(import.meta.url).resolve(
  "axe-core/axe.min.js",
);

/** WCAG 2.0 to 2.2, levels A and AA. */
const WCAG_AA_TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];

const RETIRED_URLS = [
  { from: "/philosophy", to: "/vision" },
  { from: "/fr/philosophy", to: "/fr/vision" },
  { from: "/docs/vision", to: "/vision" },
  { from: "/fr/docs/vision", to: "/fr/vision" },
];

const PAGES = [
  {
    alternates: { en: "/vision", fr: "/fr/vision", "x-default": "/vision" },
    lang: "en",
    path: "/vision",
    principles: "Principles",
  },
  {
    alternates: { en: "/vision", fr: "/fr/vision", "x-default": "/vision" },
    lang: "fr",
    path: "/fr/vision",
    principles: "Principes",
  },
];

const RETIRED_LINKS = [
  "/philosophy",
  "/fr/philosophy",
  "/docs/vision",
  "/fr/docs/vision",
]
  .map((href) => `a[href="${href}"]`)
  .join(", ");

/** Resource-load failures name their URL in location(), not text(), so they are ignored. */
const IGNORED_CONSOLE = ["favicon", "failed to load resource"];

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

async function alternatesOf(page: Page): Promise<Record<string, string>> {
  const links = await page
    .locator("link[rel='alternate'][hreflang]")
    .evaluateAll((elements) =>
      elements.map((element) => [
        element.getAttribute("hreflang") ?? "",
        new URL(element.getAttribute("href") ?? "", document.baseURI).pathname,
      ]),
    );

  return Object.fromEntries(links);
}

async function canonicalPath(page: Page): Promise<string> {
  const href = await page.locator("link[rel='canonical']").getAttribute("href");

  return new URL(href ?? "", page.url()).pathname;
}

test.describe("retired Vision and Philosophy URLs", () => {
  for (const { from, to } of RETIRED_URLS) {
    test(`${from} answers a permanent redirect to ${to}`, async ({
      request,
    }) => {
      const response = await request.get(from, { maxRedirects: 0 });
      const location = response.headers()["location"] ?? "";

      expect(response.status()).toBe(308);
      expect(new URL(location, response.url()).pathname).toBe(to);
    });

    test(`${from} lands a browser on the Vision page`, async ({ page }) => {
      test.slow();
      const response = await page.goto(from);

      expect(response?.status()).toBe(200);
      await expect(page).toHaveURL(new RegExp(`${to}$`));
      await expect(page.getByRole("heading", { level: 1 })).toHaveText(
        "Vision",
      );
    });
  }

  test("a redirect keeps the query", async ({ request }) => {
    const response = await request.get("/philosophy?ref=nav", {
      maxRedirects: 0,
    });
    const location = new URL(
      response.headers()["location"] ?? "",
      response.url(),
    );

    expect(response.status()).toBe(308);
    expect(`${location.pathname}${location.search}`).toBe("/vision?ref=nav");
  });
});

test.describe("Vision page", () => {
  for (const { alternates, lang, path, principles } of PAGES) {
    test(`${path} renders in ${lang} with its metadata and no console error`, async ({
      page,
    }) => {
      test.slow();
      const errors = collectConsoleErrors(page);
      const response = await page.goto(path);

      expect(response?.status()).toBe(200);
      await expect(page.locator("html")).toHaveAttribute("lang", lang);
      await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
      await expect(page.getByRole("heading", { level: 1 })).toHaveText(
        "Vision",
      );
      // Two sources merged here: the Vision narrative and the Philosophy principles.
      await expect(
        page.getByRole("heading", { level: 2, name: principles }),
      ).toBeVisible();
      // `next dev` streams the metadata after the first paint; production puts it in <head>.
      await expect
        .poll(() => alternatesOf(page), { timeout: 20_000 })
        .toEqual(alternates);
      expect(await canonicalPath(page)).toBe(path);
      expect(errors, `console errors on ${path}`).toEqual([]);
    });

    test(`${path} has no WCAG 2.2 AA violation`, async ({ page }) => {
      test.slow();
      await page.goto(path);
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
      await page.addScriptTag({ path: axeScriptPath });

      const { violations } = await page.evaluate(
        (tags) =>
          window.axe.run(document, { runOnly: { type: "tag", values: tags } }),
        WCAG_AA_TAGS,
      );

      expect(
        violations.map((violation) => ({
          help: violation.help,
          id: violation.id,
          nodes: violation.nodes.length,
        })),
      ).toEqual([]);
    });
  }

  test("the principles of the old Philosophy page are on the page", async ({
    page,
  }) => {
    test.slow();
    await page.goto("/vision");

    for (const name of [
      "Minimalist design",
      "Dark mode first",
      "No emoji style",
      "Technical excellence",
    ]) {
      await expect(page.getByRole("heading", { level: 3, name })).toBeVisible();
    }
  });
});

test.describe("links to Vision", () => {
  for (const { href, path } of [
    { href: "/vision", path: "/" },
    { href: "/vision", path: "/docs/installation" },
    { href: "/fr/vision", path: "/fr" },
    { href: "/fr/vision", path: "/fr/docs/installation" },
  ]) {
    test(`${path} links to ${href} and to no retired URL`, async ({ page }) => {
      test.slow();
      await page.goto(path);

      await expect(
        page.locator(`a[href="${href}"]`).first(),
        `link to ${href}`,
      ).toBeAttached();
      await expect(page.locator(RETIRED_LINKS)).toHaveCount(0);
    });
  }

  test("the docs sidebar no longer lists Vision as a docs article", async ({
    page,
  }) => {
    test.slow();
    await page.goto("/docs/installation");

    await expect(page.locator('a[href="/docs/cli"]').first()).toBeAttached();
    await expect(page.locator('a[href="/docs/vision"]')).toHaveCount(0);
  });
});
