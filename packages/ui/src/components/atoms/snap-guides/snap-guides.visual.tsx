import { expect, test } from "@playwright/experimental-ct-react";

import { SnapGuides } from "./snap-guides";

test.describe("SnapGuides Visual", () => {
  test("default", async ({ mount }) => {
    const component = await mount(
      <div className="relative h-[280px] w-[480px] rounded-2xl border bg-muted/30">
        <SnapGuides
          guides={[
            { id: "v-120", orientation: "vertical", x: 120 },
            { id: "v-340", orientation: "vertical", x: 340 },
            { id: "h-90", orientation: "horizontal", y: 90 },
            { id: "h-200", orientation: "horizontal", y: 200 },
          ]}
        />
      </div>,
    );
    await expect(component).toHaveScreenshot("snap-guides-default.png");
  });
});
