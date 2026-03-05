import { expect, test } from "@playwright/experimental-ct-react";

import { Toast } from "./toast";

test.describe("Toast Visual", () => {
  test("default", async ({ mount, page }) => {
    await mount(<Toast />);
    await expect(page).toHaveScreenshot("toast-default.png");
  });

  test("variant-destructive", async ({ mount, page }) => {
    await mount(<Toast variant="destructive" />);
    await expect(page).toHaveScreenshot("toast-variant-destructive.png");
  });
});
