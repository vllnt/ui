import { readFileSync } from "node:fs";

import { expect, test } from "@playwright/test";

const nativeComponents = (
  JSON.parse(
    readFileSync(
      new URL("../../../packages/ui-native/registry.json", import.meta.url),
      "utf8",
    ),
  ) as { components: { name: string }[] }
).components.map((component) => component.name);

test.describe("platform-aware component discovery", () => {
  test("redirects the retired native route into the filtered catalog", async ({
    page,
  }) => {
    const redirect = await page.request.get("/native?platform=web&ref=e2e", {
      maxRedirects: 0,
    });
    expect(redirect.status()).toBe(308);
    expect(redirect.headers().location).toBe(
      "/components?platform=native&ref=e2e",
    );

    await page.goto("/native?platform=web&ref=e2e");
    await expect(page).toHaveURL("/components?platform=native&ref=e2e");
    await expect(
      page.getByRole("navigation", { name: "Filter by implementation" }),
    ).toBeVisible();

    const sidebar = page.getByRole("complementary");
    await expect(sidebar.getByText("Renderers", { exact: true })).toHaveCount(0);
    await expect(
      sidebar.getByRole("link", { name: "Native", exact: true }),
    ).toHaveCount(0);
    await expect(
      sidebar.locator('a[aria-current="page"]'),
    ).toHaveText("Components");
  });

  test("filters the component list without changing its preview layout", async ({
    page,
  }) => {
    await page.goto("/components?platform=native&ref=e2e");

    const main = page.locator("main");
    await expect(
      main.getByRole("link", { name: "Native", exact: true }),
    ).toHaveAttribute("aria-current", "page");
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      "href",
      /\/components\?platform=native$/,
    );
    await expect(page.locator('meta[name="description"]')).toHaveAttribute(
      "content",
      "Explore all components available in the VLLNT UI library.",
    );
    const structuredData = (
      await page.locator('script[type="application/ld+json"]').allTextContents()
    ).flatMap(
      (content) =>
        JSON.parse(content) as { "@type"?: string; url?: string }[],
    );
    expect(
      structuredData.find((entry) => entry["@type"] === "CollectionPage")?.url,
    ).toMatch(/\/components\?platform=native$/);
    expect(
      (
        structuredData.find((entry) => entry["@type"] === "BreadcrumbList") as
          | { itemListElement?: { item: string }[] }
          | undefined
      )?.itemListElement?.at(-1)?.item,
    ).toMatch(/\/components\?platform=native$/);
    const nativeFirstSection = await main.locator("section").first().boundingBox();

    for (const component of nativeComponents) {
      await expect(
        main.locator(`a[href="/components/${component}?platform=native&ref=e2e"]`),
      ).toHaveCount(1);
    }
    await expect(
      main.locator('a[href*="/components/mdx-content"]'),
    ).toHaveCount(0);
    await expect(main.getByText("Web preview", { exact: true })).toHaveCount(0);

    const previewRoots = main.locator("article > div");
    const isolatedPreviews = main.locator("article [inert]");
    expect(await main.locator("article iframe").count()).toBeLessThan(
      nativeComponents.length,
    );
    await expect(previewRoots.first()).toHaveClass(/\[contain:strict\]/);
    await expect(isolatedPreviews).toHaveCount(nativeComponents.length);
    const firstPreviewFrame = isolatedPreviews.first().locator("iframe");
    await expect(firstPreviewFrame).toHaveAttribute(
      "sandbox",
      /^allow-scripts(?: allow-same-origin)?$/,
    );
    const [catalogUrl, previewSource, sandbox] = await Promise.all([
      page.url(),
      firstPreviewFrame.getAttribute("src"),
      firstPreviewFrame.getAttribute("sandbox"),
    ]);
    if (sandbox?.includes("allow-same-origin")) {
      expect(new URL(previewSource ?? "", catalogUrl).origin).not.toBe(
        new URL(catalogUrl).origin,
      );
    }
    await expect(firstPreviewFrame.contentFrame().locator("body")).not.toBeEmpty();

    await main.getByRole("link", { name: "Web", exact: true }).click();
    await expect(page).toHaveURL("/components?platform=web&ref=e2e");
    const webFirstSection = await main.locator("section").first().boundingBox();
    expect(webFirstSection?.y).toBeCloseTo(nativeFirstSection?.y ?? 0, 2);
  });

  test("preserves platform and unrelated query state across navigation", async ({
    page,
  }) => {
    await page.goto("/components?platform=native&ref=e2e");

    const firstComponentLink = page
      .locator("main")
      .getByRole("link", { name: "View component" })
      .first();
    const firstComponentHref = await firstComponentLink.getAttribute("href");
    expect(firstComponentHref).toMatch(
      /^\/components\/.+\?platform=native&ref=e2e$/,
    );
    await page.goto(firstComponentHref ?? "");
    await expect(page).toHaveURL(/\/components\/.+\?platform=native&ref=e2e$/);

    const sidebar = page.getByRole("complementary");
    await sidebar.getByRole("link", { name: "Button", exact: true }).click();
    await expect(page).toHaveURL(
      "/components/button?platform=native&ref=e2e",
    );

    await page
      .getByRole("link", { name: "Components", exact: true })
      .first()
      .click();
    await expect(page).toHaveURL("/components?platform=native&ref=e2e");

    await page.getByRole("link", { name: "fr", exact: true }).click();
    await expect(page).toHaveURL("/fr/components?platform=native&ref=e2e");
  });

  test("derives Native sidebar links from the React Native guide", async ({
    page,
  }) => {
    await page.goto("/docs/native");
    await expect(
      page
        .getByRole("complementary")
        .locator('a[href$="/components?platform=native"]')
        .first(),
    ).toBeVisible();
    await expect(
      page
        .getByRole("complementary")
        .locator('a[href$="/families/core?platform=native"]'),
    ).toHaveCount(1);

    await page.goto("/docs/native?platform=web");
    await expect(
      page
        .getByRole("complementary")
        .locator('a[href$="/components?platform=web"]')
        .first(),
    ).toBeVisible();
  });

  test("keeps the web install action as the default", async ({ page }) => {
    await page.goto("/components/button");

    const main = page.locator("main");
    await expect(
      main.getByRole("button", { name: "Copy install command" }),
    ).toBeVisible();
    await expect(main.getByRole("button", { name: "Add to v0.dev" })).toBeVisible();
    await expect(
      main.getByRole("navigation", { name: "Filter by implementation" }),
    ).toHaveCount(0);
  });

  test("compares platforms and exposes paired source without changing preview", async ({
    page,
  }) => {
    await page.goto("/components/button?platform=native");

    const main = page.locator("main");
    await expect(
      main.getByRole("heading", { name: "Native capability" }),
    ).toHaveCount(0);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      "href",
      /\/components\/button$/,
    );

    const comparison = main.locator("#platform-comparison");
    await expect(
      comparison.getByRole("heading", { name: "Platform comparison" }),
    ).toBeVisible();
    await expect(
      comparison.getByRole("row", {
        name: /Web.*@vllnt\/ui.*Browser rendering, DOM events, and ARIA semantics/,
      }),
    ).toBeVisible();
    await expect(
      comparison.getByRole("row", {
        name: /Native.*@vllnt\/ui-native, react-native.*Portable semantic options and native interaction/,
      }),
    ).toBeVisible();

    const source = main.locator("#code");
    await expect(source.getByRole("tab", { name: "Web" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    await source.getByRole("tab", { name: "Native" }).click();
    await expect(source).toContainText("Pressable");

    await expect(
      main.getByRole("button", { name: "Copy install command" }),
    ).toBeVisible();
    await expect(main.getByRole("button", { name: "Add to v0.dev" })).toBeVisible();
    await expect(main.getByRole("tab", { name: "Preview" })).toBeVisible();
    await expect(main.getByText("Storybook", { exact: true })).toBeVisible();
    await expect(main.locator('iframe[title="button preview"]').first()).toHaveAttribute(
      "sandbox",
      "allow-scripts allow-same-origin",
    );
  });

  test("localizes platform comparison and the retired route redirect", async ({
    page,
  }) => {
    await page.goto("/fr/components/button?platform=native");

    const main = page.locator("main");
    await expect(
      main.getByRole("heading", { name: "Comparaison des plateformes" }),
    ).toBeVisible();
    await expect(main.locator("#code").getByRole("tab", { name: "Natif" })).toBeVisible();

    await page.goto("/fr/native?ref=e2e");
    await expect(page).toHaveURL("/fr/components?ref=e2e&platform=native");
  });

  test("shows a simple unavailable Native row for Web-only components", async ({
    page,
  }) => {
    await page.goto("/components/mdx-content?platform=native");

    const main = page.locator("main");
    await expect(
      main.locator("#platform-comparison").getByRole("row", {
        name: /Native.*Not available/,
      }),
    ).toBeVisible();
    await expect(
      main.locator("#code").getByRole("tab", { name: "Native" }),
    ).toHaveCount(0);
    await expect(
      main.getByRole("button", { name: "Copy install command" }),
    ).toBeVisible();
    await expect(main.getByRole("tab", { name: "Preview" })).toBeVisible();
  });

  test("uses an inline desktop sidebar and bounded tablet drawer", async ({
    page,
  }) => {
    await page.setViewportSize({ height: 800, width: 1280 });
    await page.goto("/components?platform=native");

    const sidebar = page.getByRole("complementary");
    await expect(sidebar).toBeVisible();
    expect((await sidebar.boundingBox())?.width).toBeCloseTo(256, 2);
    await expect(page.getByTestId("sidebar-overlay")).toHaveCount(0);

    await page.setViewportSize({ height: 800, width: 768 });
    const trigger = page.getByRole("button", { name: "Open navigation" });
    await expect(trigger).toHaveAttribute("aria-expanded", "false");
    await trigger.click();

    await expect(sidebar).toBeVisible();
    expect((await sidebar.boundingBox())?.width).toBeCloseTo(320, 2);
    await expect(sidebar).not.toHaveAttribute("inert");
    await expect(page.getByTestId("sidebar-overlay")).toBeVisible();

    const drawerLinks = sidebar.getByRole("link");
    await drawerLinks.last().focus();
    await page.keyboard.press("Tab");
    await expect(drawerLinks.first()).toBeFocused();

    await page.keyboard.press("Escape");
    await expect(trigger).toHaveAttribute("aria-expanded", "false");
    await expect(sidebar).toHaveAttribute("inert", "");
    await expect(trigger).toBeFocused();
  });

  test("keeps the capability filter within a 320px viewport", async ({ page }) => {
    await page.setViewportSize({ height: 720, width: 320 });
    await page.goto("/components?platform=native");

    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - window.innerWidth,
    );
    expect(overflow).toBeLessThanOrEqual(0);
    await expect(
      page.getByRole("navigation", { name: "Filter by implementation" }),
    ).toBeVisible();

    await page.goto("/components/button?platform=native");
    const detailOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth - window.innerWidth,
    );
    expect(detailOverflow).toBeLessThanOrEqual(0);
    await expect(page.locator("#platform-comparison")).toBeVisible();
  });
});
