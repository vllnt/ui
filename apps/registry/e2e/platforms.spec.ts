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
  test("keeps renderer navigation out of the global header", async ({
    page,
  }) => {
    await page.goto("/native?platform=native&ref=e2e");

    await expect(
      page.getByRole("navigation", { name: "Choose a renderer" }),
    ).toHaveCount(0);

    const sidebar = page.getByRole("complementary");
    await expect(
      sidebar.getByRole("link", { name: "Web", exact: true }),
    ).toHaveAttribute("href", "/components?ref=e2e&platform=web");
    await expect(
      sidebar.getByRole("link", { name: "Native", exact: true }),
    ).toHaveAttribute("href", "/native?ref=e2e&platform=native");
    await expect(
      sidebar.getByRole("link", { name: "Native", exact: true }),
    ).toHaveAttribute("aria-current", "true");

    await page.goto("/components");
    await expect(
      page.locator("header").getByRole("navigation", {
        name: "Choose a renderer",
      }),
    ).toHaveCount(0);
    await expect(
      page.locator("main").getByRole("navigation", {
        name: "Choose a renderer",
      }),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: "All components", exact: true }),
    ).toHaveAttribute("aria-current", "page");

    await page.goto("/components?platform=web");
    await expect(
      page
        .getByRole("complementary")
        .getByRole("link", { name: "Web", exact: true }),
    ).toHaveAttribute("aria-current", "true");

    await page.goto("/docs/native");
    await expect(
      page
        .getByRole("complementary")
        .getByRole("link", { name: "Native", exact: true }),
    ).toHaveAttribute("aria-current", "true");

    await page.goto("/docs?platform=web&ref=e2e");
    const nativeGuide = page
      .getByRole("complementary")
      .getByRole("link", { name: "React Native", exact: true });
    await expect(nativeGuide).toHaveAttribute(
      "href",
      "/docs/native?platform=native&ref=e2e",
    );
    await nativeGuide.click();
    await expect(page).toHaveURL("/docs/native?platform=native&ref=e2e");

    await page.goto("/docs/native?platform=web");
    await expect(
      page
        .getByRole("complementary")
        .getByRole("link", { name: "Web", exact: true }),
    ).toHaveAttribute("aria-current", "true");
  });

  test("filters the catalog without mounting web previews", async ({ page }) => {
    await page.goto("/components?platform=native&ref=e2e");

    const main = page.locator("main");
    await expect(
      main.getByRole("link", { name: "Native", exact: true }),
    ).toHaveAttribute("aria-current", "page");

    for (const component of nativeComponents) {
      await expect(
        main.locator(`a[href="/components/${component}?platform=native&ref=e2e"]`),
      ).toHaveCount(1);
    }
    await expect(
      main.locator('a[href*="/components/mdx-content"]'),
    ).toHaveCount(0);
    await expect(main.getByText("Native renderer")).toHaveCount(
      nativeComponents.length,
    );
    await expect(main.locator("[inert]")).toHaveCount(0);
    await expect(
      page
        .getByRole("complementary")
        .getByRole("link", { name: "Native", exact: true }),
    ).toHaveAttribute("aria-current", "true");
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

  test("presents the source-only native hub truthfully", async ({ page }) => {
    await page.goto("/native?platform=native&ref=e2e");

    const main = page.locator("main");
    await expect(
      main.getByRole("heading", {
        name: "Native UI without pretending the web is native.",
      }),
    ).toBeVisible();
    await expect(
      main.getByText(String(nativeComponents.length), { exact: true }),
    ).toBeVisible();
    await expect(main.getByText("Pre-release", { exact: true })).toBeVisible();
    await expect(main.getByText(/experimental/i)).toHaveCount(0);
    await expect(
      main.getByText("pnpm add @vllnt/ui-native@canary"),
    ).toBeVisible();
    await expect(
      main.getByRole("link", { name: "Browse native components" }),
    ).toHaveAttribute("href", "/components?platform=native&ref=e2e");
    await expect(main.getByRole("button")).toHaveCount(0);
  });

  test("keeps the web install action as the default", async ({ page }) => {
    await page.goto("/components/button");

    const main = page.locator("main");
    await expect(
      main.getByRole("button", { name: "Copy install command" }),
    ).toBeVisible();
    await expect(main.getByRole("button", { name: "Add to v0.dev" })).toBeVisible();
    await expect(
      main.getByRole("link", { name: "Web", exact: true }),
    ).toHaveAttribute("aria-current", "page");
  });

  test("shows honest source availability instead of an install action", async ({
    page,
  }) => {
    await page.goto("/components/button?platform=native");

    const main = page.locator("main");
    await expect(
      main.getByRole("heading", { name: "Native capability" }),
    ).toBeVisible();
    await expect(
      main.getByText("Available after the first synchronized canary"),
    ).toBeVisible();
    await expect(
      main.getByText("pnpm add @vllnt/ui-native@canary"),
    ).toBeVisible();
    await expect(main.getByText("Portable semantic options")).toBeVisible();
    await expect(
      main.getByText("src/components/button/button.tsx"),
    ).toBeVisible();
    await expect(
      main.getByRole("button", { name: "Copy install command" }),
    ).toHaveCount(0);
    await expect(main.getByRole("button", { name: "Add to v0.dev" })).toHaveCount(
      0,
    );
    await expect(
      main.getByRole("link", { name: "Browse native catalog" }),
    ).toBeVisible();
    await expect(main.getByText("Storybook")).toHaveCount(0);
  });

  test("localizes native availability", async ({ page }) => {
    await page.goto("/fr/components/button?platform=native");

    const main = page.locator("main");
    await expect(
      main.getByRole("heading", { name: "Capacite native" }),
    ).toBeVisible();
    await expect(
      main.getByText("Disponible apres le premier canary synchronise"),
    ).toBeVisible();
    await expect(
      page
        .getByRole("complementary")
        .getByRole("link", { name: "Natif", exact: true }),
    ).toHaveAttribute("href", "/fr/native?platform=native");
  });

  test("does not silently revert unsupported native components", async ({
    page,
  }) => {
    await page.goto("/components/mdx-content?platform=native");

    const main = page.locator("main");
    await expect(
      main.getByRole("heading", { name: "Web-only component" }),
    ).toBeVisible();
    await expect(
      main.getByRole("link", { name: "Browse native catalog" }),
    ).toHaveAttribute("href", "/components?platform=native");
    await expect(
      main.getByRole("link", { name: "View Web component" }),
    ).toHaveAttribute("href", "/components/mdx-content?platform=web");
    await expect(main.getByText("Storybook")).toHaveCount(0);
  });

  test("uses an inline desktop sidebar and bounded tablet drawer", async ({
    page,
  }) => {
    await page.setViewportSize({ height: 800, width: 1280 });
    await page.goto("/native?platform=native");

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

  test("keeps the mobile header within a 320px viewport", async ({ page }) => {
    await page.setViewportSize({ height: 720, width: 320 });
    await page.goto("/components?platform=native");

    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - window.innerWidth,
    );
    expect(overflow).toBeLessThanOrEqual(0);
    await expect(
      page.getByRole("navigation", { name: "Choose a renderer" }).first(),
    ).toBeVisible();
  });
});
