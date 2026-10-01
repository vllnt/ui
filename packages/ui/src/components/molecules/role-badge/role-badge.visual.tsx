import { expect, test } from "@playwright/experimental-ct-react";

import { RoleBadge } from "./role-badge";

test.describe("RoleBadge Visual", () => {
  test("owner", async ({ mount }) => {
    const component = await mount(<RoleBadge accountRole="owner" />);
    await expect(component).toHaveScreenshot("role-badge-owner.png");
  });

  test("billing", async ({ mount }) => {
    const component = await mount(<RoleBadge accountRole="billing" />);
    await expect(component).toHaveScreenshot("role-badge-billing.png");
  });
});
