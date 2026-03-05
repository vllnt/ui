import { expect, test } from "@playwright/experimental-ct-react";

import { StepNavigation } from "./step-navigation";

test.describe("StepNavigation Visual", () => {
  test("default", async ({ mount, page }) => {
    await mount(<StepNavigation />);
    await expect(page).toHaveScreenshot("step-navigation-default.png");
  });
});
