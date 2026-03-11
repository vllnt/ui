import { expect, test } from "@playwright/experimental-ct-react";

import { Sheet } from "./sheet";

test.describe("Sheet Visual", () => {
  test("default", async ({ mount, page }) => {
    await mount(<Sheet />);
    await expect(page).toHaveScreenshot("sheet-default.png");
  });

  test("side-bottom", async ({ mount, page }) => {
    await mount(<Sheet side="bottom" />);
    await expect(page).toHaveScreenshot("sheet-side-bottom.png");
  });

  test("side-left", async ({ mount, page }) => {
    await mount(<Sheet side="left" />);
    await expect(page).toHaveScreenshot("sheet-side-left.png");
  });

  test("side-top", async ({ mount, page }) => {
    await mount(<Sheet side="top" />);
    await expect(page).toHaveScreenshot("sheet-side-top.png");
  });
});
