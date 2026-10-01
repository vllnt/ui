import { expect, test } from "@playwright/experimental-ct-react";

import { MetricCluster } from "./metric-cluster";

test.describe("MetricCluster Visual", () => {
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
        <MetricCluster
          metrics={[
            { id: "qps", label: "qps", tone: "success", value: "240" },
            { id: "errs", label: "errs", tone: "danger", value: "14" },
            { id: "p95", label: "p95", value: "180ms" },
          ]}
          title="research-2025"
          x={260}
          y={80}
        />
      </div>,
    );
    await expect(component).toHaveScreenshot("metric-cluster-default.png");
  });
});
