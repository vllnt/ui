import { expect, test } from "@playwright/experimental-ct-react";

import { PresenceSyncIndicator } from "./presence-sync-indicator";

test.describe("PresenceSyncIndicator Visual", () => {
  test("default", async ({ mount }) => {
    const component = await mount(
      <div className="flex flex-col items-start gap-2 bg-muted/30 p-4">
        <PresenceSyncIndicator state="live" status="3 peers" />
        <PresenceSyncIndicator state="syncing" status="2 changes" />
        <PresenceSyncIndicator state="reconnecting" status="retry 2 / 5" />
        <PresenceSyncIndicator state="offline" />
        <PresenceSyncIndicator state="error" status="ws closed" />
      </div>,
    );
    await expect(component).toHaveScreenshot(
      "presence-sync-indicator-default.png",
    );
  });
});
