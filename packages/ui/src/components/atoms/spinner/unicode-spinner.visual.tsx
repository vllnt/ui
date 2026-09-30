import { expect, test } from "@playwright/experimental-ct-react";

import { UnicodeSpinner } from "./unicode-spinner";

test.describe("UnicodeSpinner Visual", () => {
  test("scanline", async ({ mount, page }) => {
    await page.addStyleTag({
      content:
        "*, *::before, *::after { animation: none !important; transition: none !important; }",
    });

    const component = await mount(
      <UnicodeSpinner animation="scanline" label="Syncing feed" paused />,
    );

    await expect(component).toHaveScreenshot("unicode-spinner-scanline.png");
  });
});
