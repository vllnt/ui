"use client";

import { MarketTreemap } from "@vllnt/ui";

export default function MarketTreemapPreview() {
  return (
    <div className="w-full max-w-[320px]">
      <MarketTreemap
        items={[
          { change: 2.6, label: "NVDA", sector: "Semis", value: 980 },
          { change: 1.4, label: "MSFT", sector: "Software", value: 760 },
          { change: -1.4, label: "XOM", sector: "Energy", value: 520 },
          { change: 0.8, label: "JPM", sector: "Financials", value: 440 },
        ]}
      />
    </div>
  );
}
