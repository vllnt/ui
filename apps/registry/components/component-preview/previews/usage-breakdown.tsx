"use client";

import { UsageBreakdown } from "@vllnt/ui";

export default function UsageBreakdownPreview() {
  return (
    <UsageBreakdown
      description="Ranked resource consumption across the current workspace."
      items={[
        {
          id: "tokens",
          label: "Tokens",
          meta: "LLM",
          trend: { direction: "up", label: "+14%" },
          value: 420,
          valueLabel: "420k",
        },
        {
          id: "storage",
          label: "Storage",
          meta: "Vector DB",
          trend: { direction: "down", label: "-6%" },
          value: 260,
          valueLabel: "260 GB",
        },
        {
          id: "events",
          label: "Events",
          meta: "Tracking",
          value: 180,
          valueLabel: "180k",
        },
      ]}
      title="Usage breakdown"
    />
  );
}
