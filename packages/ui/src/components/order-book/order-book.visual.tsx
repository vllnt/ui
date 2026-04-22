import { expect, test } from "@playwright/experimental-ct-react";

import { OrderBook } from "./order-book";

const asks = [
  { price: 185.24, size: 4.2 },
  { price: 185.31, size: 6.8 },
  { price: 185.39, size: 8.1 },
  { price: 185.46, size: 10.4 },
  { price: 185.53, size: 11.7 },
];

const bids = [
  { price: 185.18, size: 5.4 },
  { price: 185.11, size: 7.1 },
  { price: 185.03, size: 9.2 },
  { price: 184.96, size: 10.1 },
  { price: 184.88, size: 12.9 },
];

test.describe("OrderBook", () => {
  test("default", async ({ mount }) => {
    const component = await mount(
      <div className="w-[920px] p-6">
        <OrderBook asks={asks} bids={bids} />
      </div>,
    );

    await expect(component).toHaveScreenshot();
  });
});
