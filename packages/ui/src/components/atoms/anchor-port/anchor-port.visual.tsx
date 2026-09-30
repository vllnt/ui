import { expect, test } from "@playwright/experimental-ct-react";

import { AnchorPort } from "./anchor-port";

test.describe("AnchorPort Visual", () => {
  test("default", async ({ mount, page }) => {
    await mount(
      <div className="flex gap-3 rounded-2xl border border-dashed border-border/70 bg-muted/20 p-6">
        <AnchorPort aria-label="Input port" tone="input" />
        <AnchorPort aria-label="Bidirectional port" state="active" tone="bidirectional" />
        <AnchorPort aria-label="Output port" state="blocked" tone="output" />
      </div>,
    );

    await expect(page).toHaveScreenshot("anchor-port-default.png");
  });
});