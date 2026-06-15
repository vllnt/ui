"use client";

import { WalletCard } from "@vllnt/ui";

export default function WalletCardPreview() {
  return (
    <WalletCard
      availableLabel="96 credits"
      balanceLabel="128 credits"
      note="Set up auto-refill to keep automations running through the month."
      pendingLabel="32 credits"
      primaryActionLabel="Buy credits"
      renewsLabel="Refreshes on May 1, 2026"
      secondaryActionLabel="Billing history"
      status="healthy"
    />
  );
}
