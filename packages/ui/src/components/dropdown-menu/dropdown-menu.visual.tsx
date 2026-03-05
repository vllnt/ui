import { expect, test } from "@playwright/experimental-ct-react";

import { DropdownMenu } from "./dropdown-menu";

test.describe("DropdownMenu Visual", () => {
  test("default", async ({ mount, page }) => {
    await mount(<DropdownMenu>Test</DropdownMenu>);
    await expect(page).toHaveScreenshot("dropdown-menu-default.png");
  });
});
