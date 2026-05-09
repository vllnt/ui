import { expect, test } from "@playwright/experimental-ct-react";

import { RuntimeOverviewPanel } from "./runtime-overview-panel";

test.describe("RuntimeOverviewPanel Visual", () => {
  test("default", async ({ mount }) => {
    const component = await mount(
      <div className="w-72 p-4">
        <RuntimeOverviewPanel
          metrics={[
            {
              id: "runs",
              label: "Active runs",
              tone: "success",
              trend: "up",
              value: 3,
            },
            {
              detail: "0 last hour",
              id: "errs",
              label: "Errors",
              tone: "neutral",
              trend: "flat",
              value: 0,
            },
            {
              id: "tps",
              label: "Throughput",
              tone: "success",
              trend: "up",
              value: "120 / s",
            },
            {
              detail: "p95 240ms",
              id: "lat",
              label: "Latency",
              tone: "warn",
              trend: "down",
              value: "180ms",
            },
          ]}
        />
      </div>,
    );
    await expect(component).toHaveScreenshot(
      "runtime-overview-panel-default.png",
    );
  });
});
