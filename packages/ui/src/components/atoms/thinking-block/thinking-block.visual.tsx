import { expect, test } from "@playwright/experimental-ct-react";

import { ThinkingBlock } from "./thinking-block";

test.describe("ThinkingBlock Visual", () => {
  test("default", async ({ mount, page }) => {
    await mount(<ThinkingBlock />);
    await expect(page).toHaveScreenshot("thinking-block-default.png");
  });
});
