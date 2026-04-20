import { expect, test } from "@playwright/experimental-ct-react";

import { NumberTicker } from "./number-ticker";

test.describe("NumberTicker Visual", () => {
  test("default", async ({ mount }) => {
    const component = await mount(
      <div className="rounded-lg border p-6 text-5xl font-semibold">
        <NumberTicker duration={0} value={12840} />
      </div>,
    );

    await expect(component).toHaveScreenshot("number-ticker-default.png");
  });
});
