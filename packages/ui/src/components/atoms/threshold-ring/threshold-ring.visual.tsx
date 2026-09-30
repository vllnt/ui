import { expect, test } from "@playwright/experimental-ct-react";

import { ThresholdRing } from "./threshold-ring";

test.describe("ThresholdRing Visual", () => {
  test("default", async ({ mount }) => {
    const component = await mount(
      <div className="flex items-center gap-4 bg-muted/30 p-6">
        <ThresholdRing centerLabel="32%" tone="success" value={0.32} />
        <ThresholdRing
          centerLabel="68%"
          threshold={0.7}
          tone="warn"
          value={0.68}
        />
        <ThresholdRing
          centerLabel="92%"
          threshold={0.7}
          tone="danger"
          value={0.92}
        />
      </div>,
    );
    await expect(component).toHaveScreenshot(
      "threshold-ring-default.png",
    );
  });
});
