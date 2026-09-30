import { expect, test } from "@playwright/experimental-ct-react";

import { Dialog } from "./dialog";

test.describe("Dialog Visual", () => {
  test("default", async ({ mount, page }) => {
    await mount(<Dialog>Test</Dialog>);
    await expect(page).toHaveScreenshot("dialog-default.png");
  });
});
