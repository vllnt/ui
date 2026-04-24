import { expect, test } from "@playwright/experimental-ct-react";

import { WalletCard } from "./wallet-card";

test.describe("WalletCard Visual", () => {
  test("healthy", async ({ mount, page }) => {
    await mount(
      <WalletCard
        availableLabel="96 credits"
        balanceLabel="128 credits"
        note="Set up auto-refill to avoid interruptions during peak usage."
        pendingLabel="32 credits"
        primaryActionLabel="Buy credits"
        renewsLabel="Refreshes on May 1"
        secondaryActionLabel="Billing history"
        status="healthy"
      />,
    );
    await expect(page).toHaveScreenshot("wallet-card-healthy.png");
  });
});
