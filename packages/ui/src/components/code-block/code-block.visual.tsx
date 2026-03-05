import { expect, test } from "@playwright/experimental-ct-react";

import { CodeBlock } from "./code-block";

test.describe("CodeBlock Visual", () => {
  test("default", async ({ mount, page }) => {
    await mount(<CodeBlock />);
    await expect(page).toHaveScreenshot("code-block-default.png");
  });
});
