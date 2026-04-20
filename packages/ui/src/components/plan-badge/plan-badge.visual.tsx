import { expect, test } from "@playwright/experimental-ct-react";

import { PlanBadge } from "./plan-badge";

test.describe("PlanBadge Visual", () => {
  test("default", async ({ mount }) => {
    const component = await mount(<PlanBadge tier="growth" />);
    await expect(component).toHaveScreenshot("plan-badge-default.png");
  });

  test("trial", async ({ mount }) => {
    const component = await mount(<PlanBadge state="trial" tier="starter" />);
    await expect(component).toHaveScreenshot("plan-badge-trial.png");
  });
});
