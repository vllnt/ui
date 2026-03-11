import { expect, test } from "@playwright/experimental-ct-react";

import { TutorialMDX } from "./tutorial-mdx";

test.describe("TutorialMDX Visual", () => {
  test("default", async ({ mount, page }) => {
    await mount(<TutorialMDX />);
    await expect(page).toHaveScreenshot("tutorial-mdx-default.png");
  });
});
