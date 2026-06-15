"use client";

import { SeverityBadge } from "@vllnt/ui";

export default function SeverityBadgePreview() {
  return (
    <div className="flex flex-wrap gap-2">
      <SeverityBadge level="critical" />
      <SeverityBadge level="high" />
      <SeverityBadge level="medium" />
      <SeverityBadge level="low" />
      <SeverityBadge level="info" />
    </div>
  );
}
