import { expect, test } from "@playwright/experimental-ct-react";

import { ShareSection } from "./share-section";

test.describe("ShareSection Visual", () => {
  test("default", async ({ mount, page }) => {
    await mount(<ShareSection />);
    await expect(page).toHaveScreenshot("share-section-default.png");
  });
});
