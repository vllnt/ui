import { expect, test } from "@playwright/experimental-ct-react";

import { Carousel } from "./carousel";

test.describe("Carousel Visual", () => {
  test("default", async ({ mount, page }) => {
    await mount(<Carousel />);
    await expect(page).toHaveScreenshot("carousel-default.png");
  });
});
