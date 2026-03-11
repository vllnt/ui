import { expect, test } from "@playwright/experimental-ct-react";

import { ResizableHandle } from "./resizable";

test.describe("ResizableHandle Visual", () => {
  test("default", async ({ mount, page }) => {
    await mount(<ResizableHandle />);
    await expect(page).toHaveScreenshot("resizable-default.png");
  });
});
