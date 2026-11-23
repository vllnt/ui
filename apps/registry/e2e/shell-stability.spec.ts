import { expect, test, type Page } from "@playwright/test";

const PRODUCTION_ONLY =
  "Layout shift and hydration of prerendered HTML are only meaningful on a production build; run with PLAYWRIGHT_BASE_URL against `next start`.";

/**
 * Most fetches a page may make on its way to quiet: header and in-view links
 * prefetch in two steps (route tree, then data), about 30 on the busiest page.
 */
const MAX_SETTLED_FETCHES = 80;

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

test.describe("a loaded page stops requesting", () => {
  for (const { height, name, width } of WIDTHS) {
    for (const path of ["/", "/components", "/docs/installation"]) {
      test(`${path} at ${name} width goes quiet with no failed request`, async ({
        page,
      }) => {
        test.skip(!process.env.PLAYWRIGHT_BASE_URL, PRODUCTION_ONLY);
        test.setTimeout(60_000);
        await page.setViewportSize({ height, width });
        const failed: string[] = [];
        let fetches = 0;
        page.on("response", (response) => {
          if (response.status() >= 400) {
            failed.push(`${response.status()} ${response.url()}`);
          }
        });
        page.on("request", (request) => {
          if (
            request.resourceType() === "fetch" &&
            request.frame() === page.mainFrame()
          ) {
            fetches += 1;
          }
        });
        await page.goto(path);

        await expect
          .poll(
            async () => {
              const before = fetches;
              await page.waitForTimeout(3000);

              return fetches - before;
            },
            { intervals: [0], timeout: 40_000 },
          )
          .toBe(0);
        expect(failed).toEqual([]);
        expect(fetches).toBeLessThan(MAX_SETTLED_FETCHES);
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

  test("shell links drop parameters that are not a platform variant", async ({
    page,
  }) => {
    await page.goto("/components/button?component=x&ref=e2e");

    await expect(
      page.locator("header a", { hasText: "Components" }).first(),
    ).toHaveAttribute("href", "/components");
    await expect(
      page.locator("header a[href*='component='], header a[href*='ref=']"),
    ).toHaveCount(0);
    await expect(
      page.locator("aside a[href*='component='], aside a[href*='ref=']"),
    ).toHaveCount(0);
  });

  test("switching platform on a page updates the header links without a reload", async ({
    page,
  }) => {
    await page.goto("/components");
    const components = page.locator("header a", { hasText: "Components" });
    await expect(components.first()).toHaveAttribute("href", "/components");

    // A click that lands before the page hydrates is dropped; retry until it navigates.
    await expect(async () => {
      await page
        .getByRole("navigation", { name: "Filter by implementation" })
        .getByRole("link", { name: "Native" })
        .click();
      await expect(page).toHaveURL("/components?platform=native", {
        timeout: 5000,
      });
    }).toPass({ timeout: 20_000 });
    await expect(components.first()).toHaveAttribute(
      "href",
      "/components?platform=native",
    );
  });
});
