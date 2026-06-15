"use client";

import { CreditBadge } from "@vllnt/ui";

export default function CreditBadgePreview() {
  return (
    <div className="flex flex-col items-start gap-2">
      <CreditBadge amount="420 credits" status="healthy" />
      <CreditBadge amount="24 credits" status="low" />
      <CreditBadge amount="0 credits" status="depleted" />
    </div>
  );
}
