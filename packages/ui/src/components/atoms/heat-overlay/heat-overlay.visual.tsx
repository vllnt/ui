import { expect, test } from "@playwright/experimental-ct-react";

import { HeatOverlay } from "./heat-overlay";

test.describe("HeatOverlay Visual", () => {
  test("default", async ({ mount }) => {
    const component = await mount(
      <div
        className="relative bg-muted/20"
        style={{ height: 240, width: 360 }}
      >
        <HeatOverlay
          points={[
            { id: "a", tone: "danger", weight: 1, x: 90, y: 80 },
            { id: "b", tone: "warn", weight: 0.6, x: 200, y: 110 },
            { id: "c", tone: "cool", weight: 0.4, x: 280, y: 180 },
            { id: "d", weight: 0.5, x: 140, y: 180 },
          ]}
        />
      </div>,
    );
    await expect(component).toHaveScreenshot("heat-overlay-default.png");
  });
});
