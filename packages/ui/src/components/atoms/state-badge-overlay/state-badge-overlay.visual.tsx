import { expect, test } from "@playwright/experimental-ct-react";

import { StateBadgeOverlay } from "./state-badge-overlay";

test.describe("StateBadgeOverlay Visual", () => {
  test("default", async ({ mount }) => {
    const component = await mount(
      <div
        className="relative bg-muted/30"
        style={{ height: 240, width: 360 }}
      >
        <div
          className="absolute rounded-md border border-border bg-background"
          style={{ height: 80, left: 100, top: 80, width: 160 }}
        />
        <StateBadgeOverlay state="running" x={260} y={80} />
        <StateBadgeOverlay
          anchor="bottom-left"
          state="failed"
          x={100}
          y={160}
        />
        <StateBadgeOverlay
          anchor="bottom-right"
          state="complete"
          x={260}
          y={160}
        />
      </div>,
    );
    await expect(component).toHaveScreenshot(
      "state-badge-overlay-default.png",
    );
  });
});
