import { expect, test } from "@playwright/experimental-ct-react";

import { MultiSelectLasso } from "./multi-select-lasso";

test.describe("MultiSelectLasso Visual", () => {
  test("default", async ({ mount }) => {
    const component = await mount(
      <div
        className="relative bg-muted/30"
        style={{ height: 240, width: 360 }}
      >
        <MultiSelectLasso
          count={4}
          hint="Drag"
          rect={{ height: 120, width: 180, x: 60, y: 50 }}
        />
      </div>,
    );
    await expect(component).toHaveScreenshot(
      "multi-select-lasso-default.png",
    );
  });
});
