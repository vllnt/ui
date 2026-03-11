import { expect, test } from "@playwright/experimental-ct-react";

import { InputOTP } from "./input-otp";

test.describe("InputOTP Visual", () => {
  test("default", async ({ mount, page }) => {
    await mount(<InputOTP />);
    await expect(page).toHaveScreenshot("input-otp-default.png");
  });
});
