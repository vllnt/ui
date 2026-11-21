import { expect, type Page, test } from "@playwright/test";

/**
 * The articles collection is read from `test/fixtures/articles` (see
 * `playwright.config.ts`), which holds two published articles and a draft. A
 * deployed instance has its own collection, so these tests only run against
 * the local server.
 */
test.skip(
  Boolean(process.env.PLAYWRIGHT_BASE_URL),
  "reads the fixture collection of the local server",
);

const NEWEST = "fixture-article";
const OLDER = "fixture-older";
const DRAFT = "fixture-draft";
const NEWEST_TITLE = "Fixture article on glass surfaces | VLLNT UI";

function consoleErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  page.on("pageerror", (error) => {
    errors.push(error.message);
  });

  return errors;
}

async function jsonLdNodes(page: Page): Promise<Record<string, unknown>[]> {
  await expect
    .poll(() => page.locator('script[type="application/ld+json"]').count(), {
      timeout: 10_000,
    })
    .toBeGreaterThan(0);
  const blocks = await page
    .locator('script[type="application/ld+json"]')
    .allTextContents();

  return blocks.flatMap((block) => {
    const parsed: unknown = JSON.parse(block);
    const graph =
      typeof parsed === "object" && parsed !== null && "@graph" in parsed
        ? parsed["@graph"]
        : parsed;
    const nodes: unknown[] = Array.isArray(graph) ? graph : [graph];

    return nodes.filter(
      (node): node is Record<string, unknown> =>
        typeof node === "object" && node !== null,
    );
  });
}

for (const locale of ["en", "fr"] as const) {
  const prefix = locale === "en" ? "" : "/fr";

  test.describe(`${locale}: articles`, () => {
    test("the index lists published articles, newest first, with feeds", async ({
      page,
    }) => {
      const errors = consoleErrors(page);
      await page.goto(`${prefix}/articles`);

      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
      const hrefs = await page
        .locator(
          `main a[href$="/articles/${NEWEST}"], main a[href$="/articles/${OLDER}"]`,
        )
        .evaluateAll((links) =>
          links.map((link) => link.getAttribute("href") ?? ""),
        );
      expect(hrefs).toEqual([
        `${prefix}/articles/${NEWEST}`,
        `${prefix}/articles/${OLDER}`,
      ]);
      await expect(
        page.locator(`main a[href$="/articles/${DRAFT}"]`),
      ).toHaveCount(0);

      await expect(
        // the layout also advertises the site-wide release feeds
        page.locator(
          'link[rel="alternate"][type="application/rss+xml"][href*="/articles/"]',
        ),
      ).toHaveAttribute("href", new RegExp(`/articles/${locale}/rss\\.xml$`));
      await expect(
        page.locator(
          'link[rel="alternate"][type="application/atom+xml"][href*="/articles/"]',
        ),
      ).toHaveAttribute("href", new RegExp(`/articles/${locale}/atom\\.xml$`));
      expect(errors).toEqual([]);
    });

    test("a reader opens an article from the index and comes back", async ({
      page,
    }) => {
      const errors = consoleErrors(page);
      await page.goto(`${prefix}/articles`);
      // A click that lands before the page hydrates is dropped; retry until it navigates.
      const articleUrl = new RegExp(`${prefix}/articles/${NEWEST}$`);
      await expect(async () => {
        await page
          .locator(`main a[href$="/articles/${NEWEST}"]`)
          .first()
          .click();
        await expect(page).toHaveURL(articleUrl, { timeout: 5000 });
      }).toPass({ timeout: 20_000 });
      await expect(page.getByRole("heading", { level: 1 })).toHaveText(
        /glass surfaces|surfaces en verre/i,
      );
      await expect(page.locator("main")).toContainText(/What ships|Ce qui/);

      await page.goBack();
      await expect(page).toHaveURL(new RegExp(`${prefix}/articles$`));
      expect(errors).toEqual([]);
    });

    test("an article carries its own title, canonical, hreflang and social image", async ({
      page,
    }) => {
      await page.goto(`${prefix}/articles/${NEWEST}`);

      if (locale === "en") {
        await expect(page).toHaveTitle(NEWEST_TITLE);
      } else {
        await expect(page).toHaveTitle(
          "Article de test sur les surfaces en verre | VLLNT UI",
        );
      }
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
        "href",
        new RegExp(`^https?://[^/]+${prefix}/articles/${NEWEST}$`),
      );
      await expect(page.locator('link[hreflang="en"]')).toHaveAttribute(
        "href",
        new RegExp(`^https?://[^/]+/articles/${NEWEST}$`),
      );
      await expect(page.locator('link[hreflang="fr"]')).toHaveAttribute(
        "href",
        new RegExp(`^https?://[^/]+/fr/articles/${NEWEST}$`),
      );
      await expect(page.locator('link[hreflang="x-default"]')).toHaveAttribute(
        "href",
        new RegExp(`^https?://[^/]+/articles/${NEWEST}$`),
      );
      await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
        "content",
        /\/fixture-article-card\.png$/,
      );
      await expect(page.locator('meta[property="og:title"]')).toHaveAttribute(
        "content",
        locale === "en"
          ? NEWEST_TITLE
          : "Article de test sur les surfaces en verre | VLLNT UI",
      );
      await expect(
        page.locator('meta[name="robots"][content*="noindex"]'),
      ).toHaveCount(0);
    });

    test("an article without a hosted image uses the generated social card", async ({
      page,
    }) => {
      await page.goto(`${prefix}/articles/${OLDER}`);

      await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
        "content",
        /\/api\/og\?/,
      );
    });

    test("an article emits Article and BreadcrumbList JSON-LD in its own locale", async ({
      page,
    }) => {
      await page.goto(`${prefix}/articles/${NEWEST}`);
      const nodes = await jsonLdNodes(page);
      const article = nodes.find((node) => node["@type"] === "Article");
      const breadcrumb = nodes.find(
        (node) => node["@type"] === "BreadcrumbList",
      );

      expect(article).toMatchObject({
        dateModified: "2026-11-02",
        datePublished: "2026-10-05",
        inLanguage: locale,
      });
      expect(String(article?.url)).toMatch(
        new RegExp(`^https?://[^/]+${prefix}/articles/${NEWEST}$`),
      );
      expect(breadcrumb).toBeDefined();
    });
  });
}

test.describe("a draft article", () => {
  for (const prefix of ["", "/fr"]) {
    test(`${prefix}/articles/${DRAFT} is a 404`, async ({ page }) => {
      const response = await page.goto(`${prefix}/articles/${DRAFT}`);

      expect(response?.status()).toBe(404);
    });
  }
});

test.describe("article feeds", () => {
  for (const locale of ["en", "fr"]) {
    test(`${locale}: RSS and Atom list the published articles only`, async ({
      request,
    }) => {
      const rss = await request.get(`/articles/${locale}/rss.xml`);
      const atom = await request.get(`/articles/${locale}/atom.xml`);
      const prefix = locale === "en" ? "" : "/fr";

      expect(rss.ok()).toBe(true);
      expect(rss.headers()["content-type"]).toContain("application/rss+xml");
      expect(atom.ok()).toBe(true);
      expect(atom.headers()["content-type"]).toContain("application/atom+xml");
      for (const body of [await rss.text(), await atom.text()]) {
        expect(body).toContain(`${prefix}/articles/${NEWEST}`);
        expect(body).toContain(`${prefix}/articles/${OLDER}`);
        expect(body).not.toContain(DRAFT);
      }
    });
  }

  test("the release feeds keep their own channel", async ({ request }) => {
    const rss = await (await request.get("/rss.xml")).text();
    const atom = await (await request.get("/atom.xml")).text();

    expect(rss).toContain("<title>VLLNT UI Releases</title>");
    expect(rss).not.toContain("/articles/");
    expect(atom).toContain("<title>VLLNT UI Releases</title>");
    expect(atom).not.toContain("/articles/");
  });
});

test.describe("mobile", () => {
  test.use({ viewport: { height: 667, width: 375 } });

  for (const path of ["/articles", `/articles/${NEWEST}`]) {
    test(`${path} does not scroll sideways at 375px`, async ({ page }) => {
      const errors = consoleErrors(page);
      await page.goto(path);
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

      const overflow = await page.evaluate(
        () =>
          document.documentElement.scrollWidth -
          document.documentElement.clientWidth,
      );
      expect(overflow).toBeLessThanOrEqual(0);
      expect(errors).toEqual([]);
    });
  }
});
