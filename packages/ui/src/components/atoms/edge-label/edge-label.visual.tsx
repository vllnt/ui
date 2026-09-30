import { expect, test } from "@playwright/experimental-ct-react";

import { EdgeLabel } from "./edge-label";

test.describe("EdgeLabel Visual", () => {
  test("default", async ({ mount, page }) => {
    await mount(<EdgeLabel emphasis="active">artifact stream</EdgeLabel>);

    await expect(page).toHaveScreenshot("edge-label-default.png");
  });
});