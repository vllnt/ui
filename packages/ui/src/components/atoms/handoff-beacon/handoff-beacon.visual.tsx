import { expect, test } from "@playwright/experimental-ct-react";

import { HandoffBeacon } from "./handoff-beacon";

test.describe("HandoffBeacon Visual", () => {
  test("default", async ({ mount }) => {
    const component = await mount(
      <div className="relative h-[260px] w-[480px] rounded-2xl border bg-muted/30">
        <HandoffBeacon
          level="info"
          message="Heads up"
          source="Sam"
          x={120}
          y={80}
        />
        <HandoffBeacon
          level="request"
          message="Need a review"
          source="Wei"
          x={260}
          y={150}
        />
        <HandoffBeacon
          level="urgent"
          message="Schema mismatch"
          source="Riley"
          x={380}
          y={70}
        />
      </div>,
    );
    await expect(component).toHaveScreenshot("handoff-beacon-default.png");
  });
});
