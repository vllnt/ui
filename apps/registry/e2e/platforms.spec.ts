import { expect, test } from "@playwright/test";

const nativeComponents = ["badge", "button", "card", "heading", "text"];

test.describe("platform-aware component discovery", () => {
  test("filters the catalog to native-capable components", async ({ page }) => {
    await page.goto("/components?platform=native");

    const main = page.locator("main");
    await expect(
      main.getByRole("link", { name: "Native", exact: true }),
    ).toHaveAttribute("aria-current", "page");

    for (const component of nativeComponents) {
      await expect(
        main.locator(`a[href="/components/${component}"]`),
      ).toHaveCount(1);
    }
    await expect(main.locator('a[href="/components/accordion"]')).toHaveCount(
      0,
    );
    await expect(main.getByText("Native · Experimental")).toHaveCount(5);
  });

  test("shows native status and installation on a portable component", async ({
    page,
  }) => {
    await page.goto("/components/button");

    const main = page.locator("main");
    await expect(
      main
        .getByLabel("Supported platforms")
        .first()
        .getByText("Native · Experimental"),
    ).toBeVisible();
    await expect(
      main.getByRole("heading", { name: "React Native installation" }),
    ).toBeVisible();
    await expect(
      main.getByText("pnpm add @vllnt/ui-native@canary"),
    ).toBeVisible();
  });

  test("keeps web-only components labeled and unfiltered by default", async ({
    page,
  }) => {
    await page.goto("/components/accordion");

    const main = page.locator("main");
    const headerPlatforms = main.getByLabel("Supported platforms").first();
    await expect(headerPlatforms.getByText("Web", { exact: true })).toBeVisible();
    await expect(headerPlatforms.getByText("Native · Experimental")).toHaveCount(
      0,
    );
    await expect(
      main.getByRole("heading", { name: "React Native installation" }),
    ).toHaveCount(0);
  });
});
