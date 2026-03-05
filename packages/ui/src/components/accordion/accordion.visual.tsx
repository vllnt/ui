import { expect, test } from "@playwright/experimental-ct-react";

import { Accordion } from "./accordion";

test.describe("Accordion Visual", () => {
  test("default", async ({ mount, page }) => {
    await mount(<Accordion>Test</Accordion>);
    await expect(page).toHaveScreenshot("accordion-default.png");
  });
});
