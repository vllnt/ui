import { expect, test } from "@playwright/experimental-ct-react";

import { LiveCursor } from "./live-cursor";

test.describe("LiveCursor Visual", () => {
  test("default", async ({ mount }) => {
    const component = await mount(
      <div
        className="relative bg-muted/30"
        style={{ height: 240, width: 360 }}
      >
        <LiveCursor color="#5b8def" name="Bea" x={80} y={80} />
        <LiveCursor color="#10b981" name="Lior" status="editing" x={200} y={140} />
        <LiveCursor color="#f59e0b" name={null} x={300} y={200} />
      </div>,
    );
    await expect(component).toHaveScreenshot("live-cursor-default.png");
  });
});
