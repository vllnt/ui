import { expect, test } from "@playwright/experimental-ct-react";

import { Rating } from "./rating";

test.describe("Rating Visual", () => {
  test("default", async ({ mount, page }) => {
    await mount(
      <div className="p-6">
        <Rating defaultValue={4} label="Lesson rating" showValue />
      </div>,
    );

    await expect(page).toHaveScreenshot("rating-default.png");
  });
});
