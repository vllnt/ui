import { expect, test } from "@playwright/test";

const PRODUCTION_ONLY =
  "Cache-Control of prerendered pages is only meaningful on a production build; run with PLAYWRIGHT_BASE_URL against `next start`.";

test.describe("health check", () => {
  test("answers 200 without rendering a page or setting cookies", async ({
    request,
  }) => {
    const response = await request.get("/healthz");

    expect(response.status()).toBe(200);
    expect(await response.text()).toBe("ok");
    expect(response.headers()["cache-control"]).toBe("no-store");
    expect(response.headers()["set-cookie"]).toBeUndefined();
  });
});

const LANGUAGE_HEADERS: {
  readonly headers: Record<string, string>;
  readonly label: string;
}[] = [
  { label: "no Accept-Language", headers: {} },
  { label: "Accept-Language en", headers: { "accept-language": "en" } },
  { label: "Accept-Language fr", headers: { "accept-language": "fr" } },
];

test.describe("public pages stay cookie-free and cacheable", () => {
  for (const { headers, label } of LANGUAGE_HEADERS) {
    for (const path of [
      "/",
      "/components",
      "/components/button",
      "/fr/components/button",
      "/docs/installation",
      "/families/form",
    ]) {
      test(`${path} sets no cookie with ${label}`, async ({ request }) => {
        const response = await request.get(path, {
          headers,
          maxRedirects: 0,
        });

        expect(response.status()).toBeLessThan(400);
        expect(response.headers()["set-cookie"]).toBeUndefined();
      });
    }

    for (const path of ["/native", "/fr/native", "/native?platform=web"]) {
      test(`${path} redirects without a cookie with ${label}`, async ({
        request,
      }) => {
        const response = await request.get(path, {
          headers,
          maxRedirects: 0,
        });

        expect(response.status()).toBeGreaterThanOrEqual(300);
        expect(response.status()).toBeLessThan(400);
        expect(response.headers()["set-cookie"]).toBeUndefined();
      });
    }
  }

  for (const path of [
    "/components",
    "/components/button",
    "/fr/components/button",
    "/components/button?platform=native",
    "/docs/installation",
    "/docs/installation?platform=native",
    "/families/form",
    "/families?platform=native",
  ]) {
    test(`${path} is served from the prerender cache`, async ({ request }) => {
      test.skip(!process.env.PLAYWRIGHT_BASE_URL, PRODUCTION_ONLY);
      const response = await request.get(path);

      expect(response.status()).toBe(200);
      expect(response.headers()["cache-control"]).toMatch(/^s-maxage=\d+/);
      expect(response.headers()["cache-control"]).not.toContain("no-store");
    });
  }
});

test.describe("language choice", () => {
  test("a plain visit does not store a language", async ({ context, page }) => {
    await page.goto("/components/button");

    expect(await context.cookies()).toEqual([]);
  });

  test("picking a language in the header stores it and sticks", async ({
    context,
    page,
  }) => {
    await page.goto("/components/button");
    await expect(async () => {
      await page.getByRole("link", { exact: true, name: "fr" }).click();
      await expect(page).toHaveURL("/fr/components/button", { timeout: 5000 });
    }).toPass({ timeout: 20_000 });

    await expect
      .poll(
        async () =>
          (await context.cookies()).find(
            (cookie) => cookie.name === "NEXT_LOCALE",
          )?.value,
      )
      .toBe("fr");

    await page.goto("/components");
    await expect(page).toHaveURL("/fr/components");
  });

  test("an unprefixed URL still follows a stored choice", async ({
    request,
  }) => {
    const response = await request.get("/components", {
      headers: { cookie: "NEXT_LOCALE=fr" },
      maxRedirects: 0,
    });

    expect(response.status()).toBe(307);
    expect(response.headers().location).toBe("/fr/components");
    expect(response.headers()["set-cookie"]).toBeUndefined();
  });
});

test.describe("platform variants", () => {
  test("serve the platform from the clean URL with a platform query", async ({
    page,
  }) => {
    await page.goto("/components/button?platform=native");

    await expect(page).toHaveURL("/components/button?platform=native");
    await expect(
      page
        .locator("main")
        .getByRole("button", { name: "Copy Web install command" }),
    ).toBeVisible();

    await page.goto("/components/button");
    await expect(
      page
        .locator("main")
        .getByRole("button", { name: "Copy install command" }),
    ).toBeVisible();
  });

  test("use the first platform when the query repeats the key", async ({
    page,
  }) => {
    await page.goto("/components/button?platform=native&platform=web");

    await expect(
      page
        .locator("main")
        .getByRole("button", { name: "Copy Web install command" }),
    ).toBeVisible();
  });

  test("keep variant copies out of the search index", async ({ page }) => {
    await page.goto("/components/button");
    await expect(page.locator("main[data-pagefind-ignore]")).toHaveCount(0);

    await page.goto("/components/button?platform=native");
    await expect(page.locator("main[data-pagefind-ignore]")).toHaveCount(1);
  });

  test("private variant URLs redirect to the public URL", async ({
    request,
  }) => {
    for (const { from, to } of [
      {
        from: "/p/native/components/button",
        to: "/components/button?platform=native",
      },
      {
        from: "/fr/p/native/families/ai",
        to: "/fr/families/ai?platform=native",
      },
      { from: "/p/web/components", to: "/components?platform=web" },
    ]) {
      const response = await request.get(from, { maxRedirects: 0 });

      expect(response.status()).toBe(308);
      expect(response.headers().location).toBe(to);
    }
  });

  test("unknown variants are not found", async ({ request }) => {
    const response = await request.get("/p/bogus/components/button");

    expect(response.status()).toBe(404);
  });

  test("language links on a variant page point at public URLs", async ({
    request,
  }) => {
    for (const path of [
      "/components/button?platform=native",
      "/components/button?platform=web",
      "/fr/components/button?platform=native",
      "/families?platform=native",
      "/docs/installation?platform=native",
    ]) {
      const response = await request.get(path);
      const header = /<header[\s\S]*?<\/header>/.exec(await response.text());

      expect(header?.[0], path).toBeDefined();
      expect(header?.[0], path).not.toContain("/p/native");
      expect(header?.[0], path).not.toContain("/p/web");
    }
  });
});

/**
 * With `dynamicParams = false` an unknown slug gets the shared `_not-found`
 * prerender. Its `x-nextjs-cache: HIT` header names that one entry, not a new
 * entry per slug, so the check is on `Cache-Control`, the header a CDN obeys.
 */
test.describe("unknown slugs", () => {
  for (const path of [
    "/components/zz-unknown",
    "/fr/components/zz-unknown",
    "/components/zz-unknown?platform=native",
    "/components/zz-unknown?platform=web",
    "/fr/components/zz-unknown?platform=native",
    "/docs/zz-unknown",
    "/fr/docs/zz-unknown",
    "/families/zz-unknown",
    "/fr/families/zz-unknown",
    "/families/zz-unknown?platform=native",
  ]) {
    test(`${path} is a 404 that no cache keeps`, async ({ request }) => {
      for (const attempt of [1, 2]) {
        const response = await request.get(path);

        expect(response.status(), `attempt ${attempt.toString()}`).toBe(404);
        const cacheControl = response.headers()["cache-control"] ?? "";

        expect(cacheControl).not.toMatch(/s-maxage/);
        expect(cacheControl).toMatch(/no-store/);
      }
    });
  }
});
