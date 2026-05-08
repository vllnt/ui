import { expect, test } from "@playwright/experimental-ct-react";

import { InfinitePlane } from "./infinite-plane";

test.describe("InfinitePlane Visual", () => {
  test("default", async ({ mount }) => {
    const component = await mount(
      <div className="h-[400px] w-full">
        <InfinitePlane initialView={{ x: 60, y: 40, zoom: 1.2 }}>
          <div
            className="absolute rounded-2xl border bg-background p-3 shadow-sm"
            style={{ left: 40, top: 20, width: 200 }}
          >
            <p className="text-sm font-medium">Object A</p>
            <p className="text-xs text-muted-foreground">x=40, y=20</p>
          </div>
          <div
            className="absolute rounded-2xl border bg-background p-3 shadow-sm"
            style={{ left: 280, top: 120, width: 200 }}
          >
            <p className="text-sm font-medium">Object B</p>
            <p className="text-xs text-muted-foreground">x=280, y=120</p>
          </div>
        </InfinitePlane>
      </div>,
    );
    await expect(component).toHaveScreenshot("infinite-plane-default.png");
  });
});
