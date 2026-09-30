import { expect, test } from "@playwright/experimental-ct-react";

import { Card } from "./card";

test.describe("Card Visual", () => {
  test("default", async ({ mount, page }) => {
    await mount(<Card>Test</Card>);
    await expect(page).toHaveScreenshot("card-default.png");
  });
});
