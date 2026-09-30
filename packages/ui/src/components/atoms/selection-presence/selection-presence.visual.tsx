import { expect, test } from "@playwright/experimental-ct-react";

import { SelectionPresence } from "./selection-presence";

test.describe("SelectionPresence Visual", () => {
  test("default", async ({ mount }) => {
    const component = await mount(
      <div
        className="relative bg-muted/30"
        style={{ height: 240, width: 360 }}
      >
        <SelectionPresence
          color="#5b8def"
          height={80}
          name="Bea"
          width={120}
          x={40}
          y={50}
        />
        <SelectionPresence
          color="#10b981"
          height={50}
          name="Lior"
          width={140}
          x={180}
          y={140}
        />
      </div>,
    );
    await expect(component).toHaveScreenshot(
      "selection-presence-default.png",
    );
  });
});
