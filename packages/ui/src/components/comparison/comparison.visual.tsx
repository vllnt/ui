import { expect, test } from "@playwright/experimental-ct-react";

import { Comparison } from "./comparison";

test.describe("Comparison Visual", () => {
  test("default", async ({ mount, page }) => {
    await mount(<Comparison>Test</Comparison>);
    await expect(page).toHaveScreenshot("comparison-default.png");
  });
});
