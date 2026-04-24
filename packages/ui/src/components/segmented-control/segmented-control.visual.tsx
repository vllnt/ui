import { expect, test } from "@playwright/experimental-ct-react";

import { SegmentedControl, SegmentedControlItem } from "./segmented-control";

test.describe("SegmentedControl Visual", () => {
  test("controlled selection", async ({ mount, page }) => {
    await mount(
      <div className="w-80 p-6">
        <SegmentedControl aria-label="Billing period" defaultValue="weekly">
          <SegmentedControlItem value="daily">Daily</SegmentedControlItem>
          <SegmentedControlItem value="weekly">Weekly</SegmentedControlItem>
          <SegmentedControlItem value="monthly">Monthly</SegmentedControlItem>
        </SegmentedControl>
      </div>,
    );

    await expect(page).toHaveScreenshot("segmented-control-controlled-selection.png");
  });
});
