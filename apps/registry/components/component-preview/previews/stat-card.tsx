"use client";

import { StatCard } from "@vllnt/ui";

export default function StatCardPreview() {
  return (
    <div className="w-full max-w-sm">
      <StatCard
        change="+8.2%"
        description="Monthly recurring revenue"
        label="MRR"
        meta="vs last month"
        tone="success"
        trend="up"
        value="$42.8k"
      />
    </div>
  );
}
