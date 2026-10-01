import { expect, test } from "@playwright/experimental-ct-react";

import { NumberInput } from "./number-input";

test.describe("NumberInput Visual", () => {
  test("default", async ({ mount, page }) => {
    await mount(
      <div className="w-72 p-6">
        <NumberInput defaultValue={2} min={0} />
      </div>,
    );

    await expect(page).toHaveScreenshot("number-input-default.png");
  });
});
