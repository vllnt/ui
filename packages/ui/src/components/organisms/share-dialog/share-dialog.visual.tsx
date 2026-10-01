import { expect, test } from "@playwright/experimental-ct-react";

import { ShareDialog } from "./share-dialog";

test.describe("ShareDialog Visual", () => {
  test("default", async ({ mount, page }) => {
    await mount(<ShareDialog />);
    await expect(page).toHaveScreenshot("share-dialog-default.png");
  });
});
