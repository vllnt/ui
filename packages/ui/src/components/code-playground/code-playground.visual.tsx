import { expect, test } from "@playwright/experimental-ct-react";

import { CodePlayground } from "./code-playground";

test.describe("CodePlayground Visual", () => {
  test("default", async ({ mount, page }) => {
    await mount(<CodePlayground />);
    await expect(page).toHaveScreenshot("code-playground-default.png");
  });
});
