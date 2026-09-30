import { expect, test } from "@playwright/experimental-ct-react";

import { TableOfContentsPanel } from "./table-of-contents-panel";

test.describe("TableOfContentsPanel Visual", () => {
  test("default", async ({ mount, page }) => {
    await mount(<TableOfContentsPanel />);
    await expect(page).toHaveScreenshot("table-of-contents-panel-default.png");
  });
});
