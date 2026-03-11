import { expect, test } from "@playwright/experimental-ct-react";

import { NavbarSaas } from "./navbar-saas";

test.describe("NavbarSaas Visual", () => {
  test("default", async ({ mount, page }) => {
    await mount(<NavbarSaas />);
    await expect(page).toHaveScreenshot("navbar-saas-default.png");
  });
});
