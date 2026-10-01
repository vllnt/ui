import { expect, test } from "@playwright/experimental-ct-react";

import { DatePicker } from "./date-picker";

const SELECTED_DATE = new Date("2026-04-19T00:00:00.000Z");

test.describe("DatePicker Visual", () => {
  test("default", async ({ mount, page }) => {
    await mount(
      <div className="w-80 p-6">
        <DatePicker value={SELECTED_DATE} />
      </div>,
    );

    await expect(page).toHaveScreenshot("date-picker-default.png");
  });
});
