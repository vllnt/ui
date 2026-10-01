import { expect, test } from "@playwright/experimental-ct-react";

import { SelectionHalo } from "./selection-halo";

test.describe("SelectionHalo Visual", () => {
  test("default", async ({ mount }) => {
    const component = await mount(
      <div className="relative h-[280px] w-[480px] rounded-2xl border bg-muted/30">
        <SelectionHalo
          bounds={{ height: 120, width: 220, x: 120, y: 90 }}
          label="3 objects"
        />
      </div>,
    );
    await expect(component).toHaveScreenshot(
      "selection-halo-default.png",
    );
  });
});
