import { expect, test } from "@playwright/experimental-ct-react";

import { AlertPulse } from "./alert-pulse";

test.describe("AlertPulse Visual", () => {
  test("default", async ({ mount }) => {
    const component = await mount(
      <div
        className="relative bg-muted/30"
        style={{ height: 240, width: 360 }}
      >
        <AlertPulse cx={90} cy={120} reducedMotion severity="info" />
        <AlertPulse cx={180} cy={120} reducedMotion severity="warn" />
        <AlertPulse cx={270} cy={120} reducedMotion severity="error" />
      </div>,
    );
    await expect(component).toHaveScreenshot("alert-pulse-default.png");
  });
});
