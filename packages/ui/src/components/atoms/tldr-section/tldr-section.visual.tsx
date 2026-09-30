import { expect, test } from "@playwright/experimental-ct-react";

import { TLDRSection } from "./tldr-section";

test.describe("TLDRSection Visual", () => {
  test("default", async ({ mount, page }) => {
    await mount(<TLDRSection>Test</TLDRSection>);
    await expect(page).toHaveScreenshot("tldr-section-default.png");
  });
});
