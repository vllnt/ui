import { expect, test } from "@playwright/experimental-ct-react";

import { Avatar } from "./avatar";

test.describe("Avatar Visual", () => {
  test("default", async ({ mount, page }) => {
    await mount(<Avatar />);
    await expect(page).toHaveScreenshot("avatar-default.png");
  });
});
