import { expect, test } from "@playwright/experimental-ct-react";

import { CountdownTimer } from "./countdown-timer";

test.describe("CountdownTimer Visual", () => {
  test("default", async ({ mount, page }) => {
    await mount(
      <div className="w-[360px]">
        <CountdownTimer
          deadline="2026-03-15T10:30:00.000Z"
          now="2026-03-15T10:00:00.000Z"
          startedAt="2026-03-15T09:00:00.000Z"
          title="SLA timer"
        />
      </div>,
    );
    await expect(page).toHaveScreenshot("countdown-timer-default.png");
  });
});
