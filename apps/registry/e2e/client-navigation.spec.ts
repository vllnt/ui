import { expect, type Page, type Response, test } from "@playwright/test";

import {
  DOCUMENT_CACHE_CONTROL,
  NEXT_ROUTER_VARY,
  UNCACHED,
} from "../lib/response-policy";

const PRODUCTION_ONLY =
  "Response headers and prefetching are only meaningful on a production build; run with PLAYWRIGHT_BASE_URL against `next start`.";

/**
 * Most RSC requests a click may cause before the page is quiet. A locale
 * switch used to start a refetch loop of thousands of requests a minute.
 */
const MAX_RSC_PER_STEP = 80;

/** What a browser sends on a page load. */
const BROWSER_ACCEPT =
  "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8";

type Log = {
  problems: string[];
  rsc: number;
};

function watch(page: Page): Log {
  const log: Log = { problems: [], rsc: 0 };
  page.on("download", (download) => {
    log.problems.push(`download prompt for ${download.url()}`);
  });
  page.on("pageerror", (error) => {
    log.problems.push(`page error: ${error.message}`);
  });
  page.on("response", (response: Response) => {
    const request = response.request();
    const headers = response.headers();
    const type = headers["content-type"] ?? "";
    const url = response.url();
    if (
      request.isNavigationRequest() &&
      request.frame() === page.mainFrame() &&
      response.status() === 200 &&
      !type.startsWith("text/html")
    ) {
      log.problems.push(`page ${url} answered ${type}`);
    }
    if (request.headers()["rsc"] !== "1") return;
    log.rsc += 1;
    if (response.status() >= 400) {
      log.problems.push(`RSC ${url} answered ${response.status().toString()}`);
    }
    if (response.status() === 200 && !type.startsWith("text/x-component")) {
      log.problems.push(`RSC ${url} answered ${type}`);
    }
    const vary = (headers["vary"] ?? "").toLowerCase();
    for (const name of NEXT_ROUTER_VARY) {
      if (!vary.includes(name)) {
        log.problems.push(`RSC ${url} misses ${name} in Vary`);
      }
    }
    if (headers["cache-control"] !== UNCACHED) {
      log.problems.push(
        `RSC ${url} has Cache-Control ${headers["cache-control"] ?? "none"}`,
      );
    }
  });

  return log;
}

/** Clicks the first visible link to `href` and waits for the page to be quiet. */
async function follow(page: Page, log: Log, href: string, expected = href) {
  const before = log.rsc;
  await page.locator(`a[href="${href}"]:visible`).first().click();
  await expect(page).toHaveURL(expected);
  await settle(page);
  expect(log.rsc - before, `RSC requests after ${href}`).toBeLessThan(
    MAX_RSC_PER_STEP,
  );
}

async function settle(page: Page) {
  await page.waitForLoadState("networkidle").catch(() => undefined);
  await page.waitForTimeout(1500);
  await expect(page.locator("body")).not.toContainText("Application error");
}

test.describe("client navigation", () => {
  test.beforeEach(() => {
    test.skip(!process.env.PLAYWRIGHT_BASE_URL, PRODUCTION_ONLY);
  });

  test("click-through, language switch both ways and history keep every answer typed and cached right", async ({
    page,
  }) => {
    test.setTimeout(180_000);
    const log = watch(page);

    await page.goto("/");
    await settle(page);
    await follow(page, log, "/docs");
    await follow(page, log, "/components");
    await follow(page, log, "/components/button");
    await follow(page, log, "/themes");
    await follow(page, log, "/templates");
    await follow(page, log, "/fr/templates");
    await follow(page, log, "/fr/docs");
    // Back to English: a canonical URL, no /en prefix left in the address bar.
    await follow(page, log, "/docs");

    for (const [move, url] of [
      [() => page.goBack(), "/fr/docs"],
      [() => page.goBack(), "/fr/templates"],
      [() => page.goForward(), "/fr/docs"],
      [() => page.goForward(), "/docs"],
      [() => page.reload(), "/docs"],
      [() => page.goBack(), "/fr/docs"],
    ] as const) {
      const before = log.rsc;
      await move();
      await expect(page).toHaveURL(url);
      await settle(page);
      expect(log.rsc - before, `RSC requests at ${url}`).toBeLessThan(
        MAX_RSC_PER_STEP,
      );
    }

    expect(log.problems).toEqual([]);
  });

  test("language links point at canonical URLs and store the choice", async ({
    context,
    page,
  }) => {
    await page.goto("/fr/docs");
    const english = page.locator('header a[hreflang="en"]:visible');

    await expect(english).toHaveAttribute("href", "/docs");
    await english.click();
    await expect(page).toHaveURL("/docs");
    expect(
      (await context.cookies()).find((cookie) => cookie.name === "NEXT_LOCALE")
        ?.value,
    ).toBe("en");
    await expect(
      page.locator('header a[hreflang="fr"]:visible'),
    ).toHaveAttribute("href", "/fr/docs");
  });

  test("a French browser can switch to English and stay there", async ({
    browser,
  }) => {
    const context = await browser.newContext({ locale: "fr-FR" });
    const page = await context.newPage();
    const log = watch(page);

    await page.goto("/");
    await expect(page).toHaveURL("/fr");
    await page.locator('header a[hreflang="en"]:visible').click();
    await expect(page).toHaveURL("/");
    await settle(page);
    await follow(page, log, "/docs");

    expect(log.problems).toEqual([]);
    await context.close();
  });
});

test.describe("response headers", () => {
  test.beforeEach(() => {
    test.skip(!process.env.PLAYWRIGHT_BASE_URL, PRODUCTION_ONLY);
  });

  for (const path of [
    "/",
    "/docs",
    "/fr/docs",
    "/components/button",
    "/themes",
    "/templates",
  ]) {
    test(`${path} is HTML with the short document policy`, async ({
      request,
    }) => {
      const response = await request.get(path, {
        headers: { accept: BROWSER_ACCEPT },
        maxRedirects: 0,
      });
      const headers = response.headers();

      expect(response.status()).toBe(200);
      expect(headers["content-type"]).toMatch(/^text\/html/);
      expect(headers["cache-control"]).toBe(DOCUMENT_CACHE_CONTROL);
      for (const name of NEXT_ROUTER_VARY) {
        expect(headers["vary"]?.toLowerCase()).toContain(name);
      }
    });
  }

  test("a client without Accept: text/html gets nothing a shared cache keeps", async ({
    request,
  }) => {
    const response = await request.get("/docs", {
      headers: { accept: "*/*", rsc: "1" },
      maxRedirects: 0,
    });

    expect(response.headers()["cache-control"]).toBe(UNCACHED);
  });

  test("an RSC request through a locale redirect is never stored and keeps the router Vary", async ({
    request,
  }) => {
    const response = await request.get("/en/docs?_rsc=abc", {
      headers: { rsc: "1" },
      maxRedirects: 0,
    });
    const headers = response.headers();

    expect(response.status()).toBe(307);
    expect(headers["cache-control"]).toBe(UNCACHED);
    for (const name of NEXT_ROUTER_VARY) {
      expect(headers["vary"]?.toLowerCase()).toContain(name);
    }
  });

  test("an unknown page gets the site's 404", async ({ page }) => {
    const response = await page.goto("/components/does-not-exist-xyz");

    expect(response?.status()).toBe(404);
    await expect(page).toHaveTitle("Page not found · VLLNT UI");
    await expect(
      page.getByRole("heading", { level: 1, name: "Page not found" }),
    ).toBeVisible();
  });
});

test.describe("keyboard", () => {
  test("the first Tab reaches a skip link that moves focus to the content", async ({
    page,
  }) => {
    await page.goto("/docs");
    await page.keyboard.press("Tab");
    const skip = page.getByRole("link", { name: "Skip to content" });

    await expect(skip).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(page.locator("main")).toBeFocused();
  });
});
