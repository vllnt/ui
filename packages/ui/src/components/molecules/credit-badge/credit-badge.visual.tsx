import { expect, test } from "@playwright/experimental-ct-react";

import { CreditBadge } from "./credit-badge";

test.describe("CreditBadge Visual", () => {
  test("healthy", async ({ mount }) => {
    const component = await mount(
      <CreditBadge amount="128 credits" status="healthy" />,
    );
    await expect(component).toHaveScreenshot("credit-badge-healthy.png");
  });

  test("overdue", async ({ mount }) => {
    const component = await mount(<CreditBadge amount="-$42" status="overdue" />);
    await expect(component).toHaveScreenshot("credit-badge-overdue.png");
  });
});
