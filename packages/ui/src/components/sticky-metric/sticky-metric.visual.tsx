import { expect, test } from "@playwright/experimental-ct-react";

import { StickyMetric } from "./sticky-metric";

test.describe("StickyMetric Visual", () => {
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
        <StickyMetric
          anchor="top-right"
          detail="↑ 12%"
          label="qps"
          tone="success"
          value="240"
          x={260}
          y={80}
        />
        <StickyMetric
          anchor="bottom-left"
          label="errs"
          tone="danger"
          value="14"
          x={100}
          y={160}
        />
      </div>,
    );
    await expect(component).toHaveScreenshot("sticky-metric-default.png");
  });
});
