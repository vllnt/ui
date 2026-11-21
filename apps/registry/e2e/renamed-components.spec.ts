import { expect, test } from "@playwright/test";

/**
 * A renamed component's old page answers with a permanent redirect through the
 * real middleware, in both locales, and a visitor lands on the new page.
 */
const MOVED = [
  ["/components/jarvis-dock", "/components/command-dock"],
  ["/fr/components/jarvis-dock", "/fr/components/command-dock"],
] as const;

const VIEWPORTS = [
  { height: 800, name: "desktop", width: 1280 },
  { height: 667, name: "mobile", width: 375 },
] as const;

test.describe("renamed component pages", () => {
  for (const [from, to] of MOVED) {
    test(`${from} answers 308 with a Location of ${to}`, async ({ request }) => {
      const response = await request.get(from, { maxRedirects: 0 });

      expect(response.status()).toBe(308);
      expect(new URL(response.headers().location ?? "", "http://x").pathname).toBe(
        to,
      );
    });
  }

  for (const viewport of VIEWPORTS) {
    test(`a ${viewport.name} visitor to the old page lands on a Command Dock page that works`, async ({
      page,
    }, testInfo) => {
      const errors: string[] = [];
      page.on("console", (message) => {
        const fromStorybook = message.location().url.includes(":6006");
        if (message.type() === "error" && !fromStorybook) {
          errors.push(message.text());
        }
      });
      page.on("pageerror", (error) => errors.push(error.message));
      await page.setViewportSize({
        height: viewport.height,
        width: viewport.width,
      });

      await page.goto("/components/jarvis-dock");

      await expect(page).toHaveURL(/\/components\/command-dock$/);
      await expect(
        page.getByRole("heading", { level: 1, name: "Command Dock" }),
      ).toBeVisible();
      const dock = page.getByRole("navigation", { name: "Command dock" });
      await expect(dock).toBeVisible();
      await dock.getByRole("button", { name: "Summon" }).click();
      await page.screenshot({
        path: testInfo.outputPath(`command-dock-${viewport.name}.png`),
      });
      expect(errors).toEqual([]);
    });
  }
});
