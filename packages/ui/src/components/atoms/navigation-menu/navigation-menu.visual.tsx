import { expect, test } from "@playwright/experimental-ct-react";

import { NavigationMenu } from "./navigation-menu";

test.describe("NavigationMenu Visual", () => {
  test("default", async ({ mount, page }) => {
    await mount(<NavigationMenu />);
    await expect(page).toHaveScreenshot("navigation-menu-default.png");
  });
});
