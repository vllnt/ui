import { expect, test } from "@playwright/experimental-ct-react";

import { Skeleton } from "./skeleton";

test.describe("Skeleton Visual", () => {
  test("default", async ({ mount, page }) => {
    await mount(<Skeleton />);
    await expect(page).toHaveScreenshot("skeleton-default.png");
  });
});
