import { expect, test } from "@playwright/experimental-ct-react";

import { Toggle } from "./toggle";

test.describe("Toggle Visual", () => {
  test("default", async ({ mount, page }) => {
    await mount(<Toggle />);
    await expect(page).toHaveScreenshot("toggle-default.png");
  });

  test("size-lg", async ({ mount, page }) => {
    await mount(<Toggle size="lg" />);
    await expect(page).toHaveScreenshot("toggle-size-lg.png");
  });

  test("size-sm", async ({ mount, page }) => {
    await mount(<Toggle size="sm" />);
    await expect(page).toHaveScreenshot("toggle-size-sm.png");
  });

  test("variant-outline", async ({ mount, page }) => {
    await mount(<Toggle variant="outline" />);
    await expect(page).toHaveScreenshot("toggle-variant-outline.png");
  });
});
