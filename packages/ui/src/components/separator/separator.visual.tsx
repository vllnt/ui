import { expect, test } from "@playwright/experimental-ct-react";

import { Separator } from "./separator";

test.describe("Separator Visual", () => {
  test("default", async ({ mount, page }) => {
    await mount(<Separator />);
    await expect(page).toHaveScreenshot("separator-default.png");
  });
});
