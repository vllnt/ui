import { expect, test } from "@playwright/experimental-ct-react";

import { InlineInput } from "./inline-input";

test.describe("InlineInput Visual", () => {
  test("default", async ({ mount, page }) => {
    await mount(<InlineInput />);
    await expect(page).toHaveScreenshot("inline-input-default.png");
  });
});
