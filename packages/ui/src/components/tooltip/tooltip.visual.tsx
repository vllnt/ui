import { expect, test } from "@playwright/experimental-ct-react";

import { Tooltip } from "./tooltip";

test.describe("Tooltip Visual", () => {
  test("default", async ({ mount, page }) => {
    await mount(<Tooltip />);
    await expect(page).toHaveScreenshot("tooltip-default.png");
  });
});
