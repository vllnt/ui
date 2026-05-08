import { expect, test } from "@playwright/experimental-ct-react";

import { PresenceSyncIndicator } from "./presence-sync-indicator";

test.describe("PresenceSyncIndicator Visual", () => {
  test("default", async ({ mount }) => {
    const component = await mount(
      <div className="flex flex-col items-start gap-2 p-4">
        <PresenceSyncIndicator detail="42 ms" status="connected" />
        <PresenceSyncIndicator detail="Saving…" status="syncing" />
        <PresenceSyncIndicator detail="Retrying" status="reconnecting" />
        <PresenceSyncIndicator status="offline" />
      </div>,
    );
    await expect(component).toHaveScreenshot(
      "presence-sync-indicator-default.png",
    );
  });
});
