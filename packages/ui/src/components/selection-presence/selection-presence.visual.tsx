import { expect, test } from "@playwright/experimental-ct-react";

import { SelectionPresence } from "./selection-presence";

test.describe("SelectionPresence Visual", () => {
  test("default", async ({ mount }) => {
    const component = await mount(
      <div className="space-y-6 p-6">
        <SelectionPresence color="emerald" name="Sam">
          <div className="rounded-2xl border bg-background p-4">
            <p className="text-sm font-medium">Object A</p>
            <p className="text-xs text-muted-foreground">
              Sam is selecting this card.
            </p>
          </div>
        </SelectionPresence>
        <SelectionPresence color="rose" name="Wei">
          <div className="rounded-2xl border bg-background p-4">
            <p className="text-sm font-medium">Object B</p>
          </div>
        </SelectionPresence>
      </div>,
    );
    await expect(component).toHaveScreenshot(
      "selection-presence-default.png",
    );
  });
});
