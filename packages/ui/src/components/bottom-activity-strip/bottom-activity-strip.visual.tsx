import { expect, test } from "@playwright/experimental-ct-react";

import { BottomActivityStrip } from "./bottom-activity-strip";

test.describe("BottomActivityStrip Visual", () => {
  test("default", async ({ mount }) => {
    const component = await mount(
      <div className="bg-muted/30 p-4" style={{ width: 480 }}>
        <BottomActivityStrip
          events={[
            { id: "1", label: "deploy ok", tone: "success", ts: "12s" },
            { id: "2", label: "queue spike", tone: "warn", ts: "1m" },
            { id: "3", label: "alert resolved", tone: "info", ts: "3m" },
            { id: "4", label: "p95 trip", tone: "danger", ts: "5m" },
            { id: "5", label: "agent idle", ts: "8m" },
          ]}
        />
      </div>,
    );
    await expect(component).toHaveScreenshot(
      "bottom-activity-strip-default.png",
    );
  });
});
