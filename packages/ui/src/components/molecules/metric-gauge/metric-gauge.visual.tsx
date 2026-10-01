import { expect, test } from "@playwright/experimental-ct-react";

import { MetricGauge } from "./metric-gauge";

test.describe("MetricGauge Visual", () => {
  test("default", async ({ mount, page }) => {
    await mount(
      <div className="w-[320px]">
        <MetricGauge label="CPU load" max={100} value={72} unit="%" />
      </div>,
    );
    await expect(page).toHaveScreenshot("metric-gauge-default.png");
  });
});
