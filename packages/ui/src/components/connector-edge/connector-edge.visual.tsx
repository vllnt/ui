import { expect, test } from "@playwright/experimental-ct-react";

import { ConnectorEdge } from "./connector-edge";

test.describe("ConnectorEdge Visual", () => {
  test("default", async ({ mount, page }) => {
    await mount(
      <div className="rounded-2xl border border-dashed border-border/70 bg-muted/10 p-6">
        <ConnectorEdge end={{ x: 320, y: 120 }} label="artifact stream" start={{ x: 0, y: 0 }} state="active" />
      </div>,
    );

    await expect(page).toHaveScreenshot("connector-edge-default.png");
  });
});