import { expect, test } from "@playwright/experimental-ct-react";

import { Separator } from "./separator";
import { PlainSeparator } from "./plain-separator";

test.describe("Separator Visual", () => {
  test("default", async ({ mount, page }) => {
    await mount(<Separator />);
    await expect(page).toHaveScreenshot("separator-default.png");
  });
  test("plain", async ({ mount, page }) => {
    await mount(<PlainSeparator />);
    await expect(page).toHaveScreenshot("separator-plain.png");
  });
});
