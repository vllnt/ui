import { expect, test } from "@playwright/test";

const PRESETS = [
  "Default",
  "Matrix",
  "Dracula",
  "Synthwave",
  "Tron",
  "Cyberpunk",
  "Nord",
  "Claude",
  "ChatGPT",
  "Gemini",
  "Future Dusk",
  "Cyber Lime",
  "Aura",
];

function dataTheme(page: import("@playwright/test").Page): Promise<null | string> {
  return page.evaluate(() => document.documentElement.getAttribute("data-theme"));
}

test.describe("theme editor", () => {
  test("loads and renders all 13 presets", async ({ page }) => {
    await page.goto("/themes");
    await expect(
      page.getByRole("heading", { name: "Create a theme" }),
    ).toBeVisible();
    for (const label of PRESETS) {
      await expect(page.getByRole("button", { name: label })).toBeVisible();
    }
  });

  test("selecting a preset re-themes the whole site and persists", async ({
    page,
  }) => {
    await page.goto("/themes");
    await page.getByRole("button", { name: "Matrix" }).click();
    await expect.poll(() => dataTheme(page)).toBe("matrix");

    const bg = await page.evaluate(() =>
      getComputedStyle(document.body).backgroundColor,
    );
    expect(bg).toContain("oklch");
    expect(bg).not.toBe("oklch(0 0 0)");

    await page.goto("/components");
    await expect.poll(() => dataTheme(page)).toBe("matrix");
  });

  test("editing a token re-themes the site live (custom)", async ({ page }) => {
    await page.goto("/themes");
    await page.getByRole("button", { name: "Matrix" }).click();
    await page
      .getByLabel("Background OKLCH channels", { exact: true })
      .fill("0.5 0.1 200");
    await expect.poll(() => dataTheme(page)).toBe("custom");
    await expect(page.locator("#vllnt-theme-custom-style")).toBeAttached();
  });

  test("reset returns to the neutral default", async ({ page }) => {
    await page.goto("/themes");
    await page.getByRole("button", { name: "Matrix" }).click();
    await expect.poll(() => dataTheme(page)).toBe("matrix");
    await page.getByRole("button", { name: "Reset" }).click();
    await expect.poll(() => dataTheme(page)).toBeNull();
  });

  test("export panel switches formats", async ({ page }) => {
    await page.goto("/themes");
    await expect(page.locator("pre")).toContainText(":root {");
    await page.getByRole("button", { name: "shadcn CLI" }).click();
    await expect(page.locator("pre")).toContainText("npx shadcn");
    await page.getByRole("button", { name: "tokens.json" }).click();
    await expect(page.locator("pre")).toContainText("oklch-channel");
  });
});
