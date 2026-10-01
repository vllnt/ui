import { expect, test } from "@playwright/experimental-ct-react";

import { Select } from "./select";

test.describe("Select Visual", () => {
  test("default", async ({ mount, page }) => {
    await mount(<Select />);
    await expect(page).toHaveScreenshot("select-default.png");
  });
});
