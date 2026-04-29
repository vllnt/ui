import { expect, test } from "@playwright/experimental-ct-react";

import { TickerTape } from "./ticker-tape";

const items = [
  { change: 1.42, price: 182.33, symbol: "AAPL", volume: "Vol 32M" },
  { change: -0.64, price: 431.8, symbol: "MSFT", volume: "Vol 18M" },
  { change: 3.08, price: 512.9, symbol: "NVDA", volume: "Vol 44M" },
  { change: -1.18, price: 287.12, symbol: "TSLA", volume: "Vol 51M" },
];

test.describe("TickerTape", () => {
  test("default", async ({ mount }) => {
    const component = await mount(
      <div className="w-[760px] p-6">
        <TickerTape items={items} />
      </div>,
    );

    await expect(component).toHaveScreenshot();
  });
});
