import { expect, test } from "@playwright/experimental-ct-react";

import { BlogCard } from "./blog-card";

test.describe("BlogCard Visual", () => {
  test("default", async ({ mount, page }) => {
    await mount(<BlogCard />);
    await expect(page).toHaveScreenshot("blog-card-default.png");
  });
});
