import { expect, test } from "@playwright/experimental-ct-react";

import { Pagination } from "./pagination";

test.describe("Pagination Visual", () => {
  test("default", async ({ mount, page }) => {
    await mount(<Pagination />);
    await expect(page).toHaveScreenshot("pagination-default.png");
  });
});
