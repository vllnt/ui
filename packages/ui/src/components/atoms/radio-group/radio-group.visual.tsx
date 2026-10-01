import { expect, test } from "@playwright/experimental-ct-react";

import { RadioGroup } from "./radio-group";

test.describe("RadioGroup Visual", () => {
  test("default", async ({ mount, page }) => {
    await mount(<RadioGroup />);
    await expect(page).toHaveScreenshot("radio-group-default.png");
  });
});
