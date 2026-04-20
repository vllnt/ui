import { expect, test } from "@playwright/experimental-ct-react";

import { PasswordInput } from "./password-input";

test.describe("PasswordInput Visual", () => {
  test("default", async ({ mount, page }) => {
    await mount(
      <div className="w-80 p-6">
        <PasswordInput placeholder="Enter password" value="super-secret" />
      </div>,
    );

    await expect(page).toHaveScreenshot("password-input-default.png");
  });
});
