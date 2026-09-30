import { expect, test } from "@playwright/experimental-ct-react";

import { CanvasFoundationDemo } from "./canvas-foundation-demo";

test.describe("CanvasShell Visual", () => {
  test("default", async ({ mount, page }) => {
    await mount(<CanvasFoundationDemo />);
    await expect(page).toHaveScreenshot("canvas-shell-default.png");
  });
});
