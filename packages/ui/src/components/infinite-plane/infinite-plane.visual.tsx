import { expect, test } from "@playwright/experimental-ct-react";

import { InfinitePlane } from "./infinite-plane";

test.describe("InfinitePlane Visual", () => {
  test("default", async ({ mount }) => {
    const component = await mount(
      <div style={{ height: 240, width: 360 }}>
        <InfinitePlane spacing={28} translate={{ x: 14, y: 14 }} zoom={1.5}>
          <div className="absolute left-12 top-10 rounded-md border border-border bg-background px-3 py-1 text-xs">
            Object A
          </div>
          <div className="absolute left-44 top-32 rounded-md border border-border bg-background px-3 py-1 text-xs">
            Object B
          </div>
        </InfinitePlane>
      </div>,
    );
    await expect(component).toHaveScreenshot("infinite-plane-default.png");
  });
});
