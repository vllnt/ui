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
  test("keeps the renderer tabs off the homepage", async ({ page }) => {
    await page.goto("/");
    await expect(
      page.getByRole("navigation", { name: "Choose a renderer" }),
    ).toHaveCount(0);

    await page.goto("/components");
    await expect(
      page.getByRole("navigation", { name: "Choose a renderer" }).first(),
    ).toBeVisible();
  });

  test("filters the catalog without mounting web previews", async ({ page }) => {
    await page.goto("/components?platform=native&ref=e2e");

    const main = page.locator("main");
    await expect(
      main.getByRole("link", { name: "Native · Experimental", exact: true }),
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
