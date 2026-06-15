"use client";

import { OrderBook } from "@vllnt/ui";

export default function OrderBookPreview() {
  return (
    <div className="w-full max-w-[320px]">
      <OrderBook
        asks={[
          { price: 185.24, size: 4.2 },
          { price: 185.31, size: 6.8 },
          { price: 185.39, size: 8.1 },
        ]}
        bids={[
          { price: 185.18, size: 5.4 },
          { price: 185.11, size: 7.1 },
          { price: 185.03, size: 9.2 },
        ]}
      />
    </div>
  );
}
