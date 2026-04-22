import { expect, test } from "@playwright/experimental-ct-react";

import { Alert } from "./alert";

test.describe("Alert Visual", () => {
  test("default", async ({ mount, page }) => {
    await mount(<Alert />);
    await expect(page).toHaveScreenshot("alert-default.png");
  });

  test("variant-destructive", async ({ mount, page }) => {
    await mount(<Alert variant="destructive" />);
    await expect(page).toHaveScreenshot("alert-variant-destructive.png");
  });
});
