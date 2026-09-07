import { expect, test } from "@playwright/test";

for (const locale of ["en", "fr"]) {
  const prefix = locale === "en" ? "" : "/fr";
  test(`${locale} guide discovery and localized SEO`, async ({ page, request }) => {
    await page.goto(`${prefix}/guides`);
    const guideLinks = page.locator("main li h2 a");
    await expect(guideLinks).toHaveCount(3);
    for (const slug of ["ai-ui", "streaming-ui", "design-tokens"]) {
      const href = `${prefix}/guides/${slug}`;
      await expect(page.locator(`main a[href="${href}"]`)).toBeVisible();
    }
    await guideLinks.first().click();
    await expect(page).toHaveURL(new RegExp(`${prefix}/guides/ai-ui$`));
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", new RegExp(`${prefix}/guides/ai-ui$`));
    await expect(page.locator('link[hreflang="fr"]')).toHaveAttribute("href", /\/fr\/guides\/ai-ui$/);
    await expect(page.locator('link[hreflang="en"]')).toHaveAttribute("href", /(?<!\/fr)\/guides\/ai-ui$/);
    await expect(page.locator('link[hreflang="x-default"]')).toHaveAttribute("href", /(?<!\/fr)\/guides\/ai-ui$/);
    await expect(page.locator('meta[name="description"]')).toHaveAttribute("content", /.+/);
    const article = page.locator('script#guide-ai-ui-json-ld');
    await expect(article).toBeAttached();
    const data = JSON.parse(await article.textContent() ?? "{}");
    expect(data["@type"]).toBe("TechArticle");
    expect(data.inLanguage).toBe(locale);
    expect(data.headline).toBe(await page.locator("h1").textContent());
    expect(data.url).toBe(await page.locator('link[rel="canonical"]').getAttribute("href"));
    const links = await page.locator('article a[href^="/"]').evaluateAll((nodes) => nodes.map((node) => node.getAttribute("href")));
    for (const href of links) {
      expect(href).toBeTruthy();
      if (locale === "fr") expect(href).toMatch(/^\/fr\//);
      if (href) expect((await request.get(href)).status()).toBe(200);
    }
    const sitemap = await request.get("/sitemap.xml");
    expect(await sitemap.text()).toContain(`${prefix}/guides/ai-ui</loc>`);
  });

  test(`${locale} unknown guides return 404`, async ({ request }) => {
    expect((await request.get(`${prefix}/guides/not-a-guide`)).status()).toBe(404);
    expect((await request.get(`${prefix}/guides/ai-ui%2F..%2Fdocs`)).status()).toBe(404);
  });
}
