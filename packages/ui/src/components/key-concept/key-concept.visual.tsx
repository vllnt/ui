import { expect, test } from "@playwright/experimental-ct-react";

import { KeyConcept } from "./key-concept";

test.describe("KeyConcept Visual", () => {
  test("default", async ({ mount, page }) => {
    await mount(<KeyConcept>Test</KeyConcept>);
    await expect(page).toHaveScreenshot("key-concept-default.png");
  });
});
