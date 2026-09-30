import { expect, test } from "@playwright/experimental-ct-react";

import { ProgressBar } from "./progress-bar";

test.describe("ProgressBar Visual", () => {
  test("default", async ({ mount, page }) => {
    await mount(<ProgressBar />);
    await expect(page).toHaveScreenshot("progress-bar-default.png");
  });
});
