import { expect, test } from "@playwright/experimental-ct-react";

import { Checkbox } from "./checkbox";

test.describe("Checkbox Visual", () => {
  test("default", async ({ mount, page }) => {
    await mount(<Checkbox />);
    await expect(page).toHaveScreenshot("checkbox-default.png");
  });
});
