"use client";

import { Watchlist } from "@vllnt/ui";

export default function WatchlistPreview() {
  return (
    <div className="w-full max-w-[320px]">
      <Watchlist
        items={[
          {
            change: 1.42,
            name: "Apple Inc.",
            price: 182.33,
            starred: true,
            symbol: "AAPL",
          },
          {
            change: -0.64,
            name: "Microsoft",
            price: 431.8,
            symbol: "MSFT",
          },
          {
            change: 3.08,
            name: "NVIDIA",
            price: 512.9,
            starred: true,
            symbol: "NVDA",
          },
        ]}
      />
    </div>
  );
}
