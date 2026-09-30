import { expect, test } from "@playwright/experimental-ct-react";

import { Spinner } from "./spinner";

test.describe("Spinner Visual", () => {
  test("default", async ({ mount, page }) => {
    await page.addStyleTag({
      content:
        "*, *::before, *::after { animation: none !important; transition: none !important; }",
    });
    const component = await mount(<Spinner />);
    await expect(component).toHaveScreenshot("spinner-default.png");
  });
});
