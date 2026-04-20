import { expect, test } from "@playwright/experimental-ct-react";

import { SubscriptionCard } from "./subscription-card";

test.describe("SubscriptionCard Visual", () => {
  test("active", async ({ mount, page }) => {
    await mount(
      <SubscriptionCard
        plan="growth"
        priceLabel="$49/mo"
        primaryActionLabel="Manage plan"
        renewalLabel="Renews on May 1"
        secondaryActionLabel="View invoices"
        seatsLabel="12 seats"
        status="active"
        usageLabel="4.2M tokens used"
      />,
    );
    await expect(page).toHaveScreenshot("subscription-card-active.png");
  });
});
