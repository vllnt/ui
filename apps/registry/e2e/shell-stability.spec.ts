import { expect, test, type Page } from "@playwright/test";

const PRODUCTION_ONLY =
  "Layout shift and hydration of prerendered HTML are only meaningful on a production build; run with PLAYWRIGHT_BASE_URL against `next start`.";

const WIDTHS = [
  { height: 900, name: "desktop", width: 1440 },
  { height: 1194, name: "tablet", width: 834 },
  { height: 844, name: "phone", width: 390 },
] as const;

const SHELL_PAGES = [
  "/",
  "/docs/installation",
  "/fr/docs/installation",
  "/families",
  "/families/form",
  "/components",
  "/components?platform=native",
  "/components/sidebar",
  "/components/button",
  "/fr/components/button",
  "/templates",
];

/**
 * Sums the layout shifts the page has had since navigation, after giving
 * hydration and the sidebar's width transition time to finish.
 */
async function totalLayoutShift(page: Page): Promise<number> {
  return page.evaluate(
    () =>
      new Promise<number>((resolve) => {
        let total = 0;
        new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (
              "value" in entry &&
              typeof entry.value === "number" &&
              "hadRecentInput" in entry &&
              entry.hadRecentInput === false
            ) {
              total += entry.value;
            }
          }
        }).observe({ buffered: true, type: "layout-shift" });
        setTimeout(() => {
          resolve(total);
        }, 2500);
      }),
  );
}

test.describe("the page shell does not move after load", () => {
  for (const { height, name, width } of WIDTHS) {
    for (const path of SHELL_PAGES) {
      test(`${path} at ${name} width stays put`, async ({ page }) => {
        test.skip(!process.env.PLAYWRIGHT_BASE_URL, PRODUCTION_ONLY);
        await page.setViewportSize({ height, width });
        await page.goto(path);

        expect(await totalLayoutShift(page)).toBeLessThan(0.01);
      });
    }
  }
});

test.describe("the prerendered shell hydrates without errors", () => {
  for (const path of [...SHELL_PAGES, "/components/button?platform=native"]) {
    test(`${path} logs no console or page errors`, async ({ page }) => {
      test.skip(!process.env.PLAYWRIGHT_BASE_URL, PRODUCTION_ONLY);
      const problems: string[] = [];
      page.on("console", (message) => {
        if (message.type() === "error") problems.push(message.text());
      });
      page.on("pageerror", (error) => {
        problems.push(error.message);
      });

      await page.goto(path);
      await page.waitForTimeout(2500);

      expect(problems).toEqual([]);
    });
  }

  test("the sidebar marks the current page after hydration", async ({
    page,
  }) => {
    for (const { href, path } of [
      { href: "/docs/installation", path: "/docs/installation" },
      { href: "/fr/docs/installation", path: "/fr/docs/installation" },
      { href: "/components/button", path: "/components/button" },
    ]) {
      await page.goto(path);

      await expect(
        page.locator(`aside a[href="${href}"][aria-current="page"]`),
      ).toBeVisible();
    }
  });
});

test.describe("the query still reaches shell links", () => {
  test("server HTML of a platform variant already links the platform", async ({
    request,
  }) => {
    const response = await request.get("/components/button?platform=native");
    const html = await response.text();
    const aside = /<aside[\s\S]*?<\/aside>/.exec(html)?.[0] ?? "";

    expect(aside).toContain("platform=native");
  });

  test("a page without a platform variant forwards the platform in the browser", async ({
    page,
  }) => {
    await page.goto("/templates?platform=native");

    await expect(
      page.locator("header a", { hasText: "Components" }).first(),
    ).toHaveAttribute("href", /platform=native/);
    await expect(
      page.locator('aside a[href*="platform=native"]'),
    ).not.toHaveCount(0);
  });

  test("switching platform on a page updates the header links without a reload", async ({
    page,
  }) => {
    await page.goto("/components");
    const components = page.locator("header a", { hasText: "Components" });
    await expect(components.first()).toHaveAttribute("href", "/components");

    await page
      .getByRole("navigation", { name: "Filter by implementation" })
      .getByRole("link", { name: "Native" })
      .click();

    await expect(page).toHaveURL("/components?platform=native");
    await expect(components.first()).toHaveAttribute(
      "href",
      "/components?platform=native",
    );
  });
});
