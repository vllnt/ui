import { expect, test } from "@playwright/test";

for (const locale of ["en", "fr"]) {
  const prefix = locale === "en" ? "" : "/fr";

  test(`${locale}: Native discovery metadata is localized and canonical`, async ({
    page,
  }) => {
    await page.goto(`${prefix}/components?platform=native&ref=seo`);
    await expect(page).toHaveTitle(/React Native.*iOS.*Android/);
    await expect(page.locator('meta[name="description"]')).toHaveAttribute(
      "content",
      /0\.4\.0.*canary/,
    );
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      "href",
      new RegExp(`${prefix}/components\\?platform=native$`),
    );
    await expect(page.locator('link[hreflang="fr"]')).toHaveAttribute(
      "href",
      /\/fr\/components\?platform=native$/,
    );
    await expect(page.locator('meta[property="og:title"]')).toHaveAttribute(
      "content",
      /React Native.*iOS.*Android/,
    );

    await page.goto(`${prefix}/components/button?platform=native&ref=seo`);
    await expect(page).toHaveTitle(/Button.*React.*React Native/);
    await expect(page.locator('meta[name="description"]')).toHaveAttribute(
      "content",
      /0\.4\.0.*npm/,
    );
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      "href",
      new RegExp(`${prefix}/components/button$`),
    );
    await expect(
      page.locator('meta[name="twitter:description"]'),
    ).toHaveAttribute("content", /0\.4\.0.*npm/);

    await page.goto(`${prefix}/components/mdx-content`);
    await expect(page).not.toHaveTitle(/React Native/);
    await expect(page.locator('meta[name="description"]')).not.toHaveAttribute(
      "content",
      /React Native/,
    );

    await page.goto(`${prefix}/docs/native`);
    await expect(page).toHaveTitle(/React Native.*0\.4\.0/);
    await expect(
      page.locator('main a[href$="/components?platform=native"]').first(),
    ).toHaveAttribute("href", `${prefix}/components?platform=native`);
  });
}
