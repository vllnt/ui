import { expect, test } from "@playwright/experimental-ct-react";

import { LiveCursor } from "./live-cursor";

test.describe("LiveCursor Visual", () => {
  test("default", async ({ mount }) => {
    const component = await mount(
      <div className="relative h-[240px] w-[480px] rounded-2xl border bg-muted/30">
        <LiveCursor color="emerald" label="Sam" x={120} y={80} />
        <LiveCursor color="blue" label="Riley" x={260} y={140} />
        <LiveCursor color="rose" label="Wei" x={380} y={50} />
      </div>,
    );
    await expect(component).toHaveScreenshot("live-cursor-default.png");
  });
});
