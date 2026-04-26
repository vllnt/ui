import { expect, test } from "@playwright/experimental-ct-react";

import { WorldClockBar } from "./world-clock-bar";

test.describe("WorldClockBar Visual", () => {
  test("default", async ({ mount, page }) => {
    await mount(
      <div className="w-[720px]">
        <WorldClockBar
          now="2026-03-15T12:00:00.000Z"
          zones={[
            { city: "San Francisco", timeZone: "America/Los_Angeles" },
            { city: "New York", timeZone: "America/New_York" },
            { city: "London", timeZone: "Europe/London" },
            { city: "Singapore", timeZone: "Asia/Singapore" },
          ]}
        />
      </div>,
    );
    await expect(page).toHaveScreenshot("world-clock-bar-default.png");
  });
});
