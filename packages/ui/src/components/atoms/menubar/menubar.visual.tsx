import { expect, test } from "@playwright/experimental-ct-react";

import { Menubar } from "./menubar";

test.describe("Menubar Visual", () => {
  test("default", async ({ mount, page }) => {
    await mount(<Menubar />);
    await expect(page).toHaveScreenshot("menubar-default.png");
  });
});
