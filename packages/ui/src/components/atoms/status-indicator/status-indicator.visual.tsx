import { expect, test } from "@playwright/experimental-ct-react";

import { StatusIndicator } from "./status-indicator";

test.describe("StatusIndicator Visual", () => {
  test("tones", async ({ mount, page }) => {
    await mount(
      <div className="flex flex-wrap gap-3 p-4">
        <StatusIndicator tone="success">Operational</StatusIndicator>
        <StatusIndicator tone="warning">Pending</StatusIndicator>
        <StatusIndicator tone="danger">Incident</StatusIndicator>
        <StatusIndicator tone="info">Queued</StatusIndicator>
      </div>,
    );

    await expect(page).toHaveScreenshot("status-indicator-tones.png");
  });
});