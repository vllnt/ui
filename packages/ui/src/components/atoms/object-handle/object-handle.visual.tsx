import { expect, test } from "@playwright/experimental-ct-react";

import { ObjectHandle } from "./object-handle";

test.describe("ObjectHandle Visual", () => {
  test("default", async ({ mount, page }) => {
    await mount(<ObjectHandle hint="⌘ drag" label="Reposition" />);

    await expect(page).toHaveScreenshot("object-handle-default.png");
  });
});