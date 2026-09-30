import { expect, test } from "@playwright/experimental-ct-react";

import { AspectRatio } from "./aspect-ratio";

test.describe("AspectRatio Visual", () => {
  test("default", async ({ mount, page }) => {
    await mount(<AspectRatio />);
    await expect(page).toHaveScreenshot("aspect-ratio-default.png");
  });
});
