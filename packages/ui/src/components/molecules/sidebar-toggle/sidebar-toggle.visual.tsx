import { expect, test } from "@playwright/experimental-ct-react";

import { SidebarToggle } from "./sidebar-toggle";

test.describe("SidebarToggle Visual", () => {
  test("default", async ({ mount, page }) => {
    await mount(<SidebarToggle />);
    await expect(page).toHaveScreenshot("sidebar-toggle-default.png");
  });
});
