import { expect, test } from "@playwright/experimental-ct-react";

import { AlertDialog } from "./alert-dialog";

test.describe("AlertDialog Visual", () => {
  test("default", async ({ mount, page }) => {
    await mount(<AlertDialog />);
    await expect(page).toHaveScreenshot("alert-dialog-default.png");
  });
});
