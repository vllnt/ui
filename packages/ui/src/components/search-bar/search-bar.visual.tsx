import { expect, test } from "@playwright/experimental-ct-react";

import { SearchBar } from "./search-bar";

test.describe("SearchBar Visual", () => {
  test("default", async ({ mount, page }) => {
    await mount(<SearchBar />);
    await expect(page).toHaveScreenshot("search-bar-default.png");
  });
});
