import { expect, test } from "@playwright/experimental-ct-react";

import { ThemeProvider } from "./theme-provider";

test.describe("ThemeProvider Visual", () => {
  test("default", async ({ mount, page }) => {
    await mount(<ThemeProvider />);
    await expect(page).toHaveScreenshot("theme-provider-default.png");
  });
});
