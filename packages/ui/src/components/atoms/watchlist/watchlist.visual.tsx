import { expect, test } from "@playwright/experimental-ct-react";

import { Watchlist } from "./watchlist";

const items = [
  {
    change: 1.42,
    name: "Apple Inc.",
    price: 182.33,
    starred: true,
    symbol: "AAPL",
    volume: "Vol 32M",
  },
  {
    change: -0.64,
    name: "Microsoft Corp.",
    price: 431.8,
    symbol: "MSFT",
    volume: "Vol 18M",
  },
  {
    change: 3.08,
    name: "NVIDIA",
    price: 512.9,
    starred: true,
    symbol: "NVDA",
    volume: "Vol 44M",
  },
  {
    change: -1.18,
    name: "Tesla",
    price: 287.12,
    symbol: "TSLA",
    volume: "Vol 51M",
  },
];

test.describe("Watchlist", () => {
  test("default", async ({ mount }) => {
    const component = await mount(
      <div className="w-[420px] p-6">
        <Watchlist items={items} />
      </div>,
    );

    await expect(component).toHaveScreenshot();
  });
});
