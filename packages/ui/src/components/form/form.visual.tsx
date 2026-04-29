import { expect, test } from "@playwright/experimental-ct-react";

import { FormInvalidEmailPreview } from "./form.visual.fixture";

test.describe("Form Visual", () => {
  test("invalid state", async ({ mount, page }) => {
    await mount(<FormInvalidEmailPreview />);

    await page.getByRole("button", { name: "Submit" }).click();

    await expect(page).toHaveScreenshot("form-invalid.png");
  });
});
