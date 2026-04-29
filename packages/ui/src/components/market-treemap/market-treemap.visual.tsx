import { expect, test } from "@playwright/experimental-ct-react";

import { MarketTreemap } from "./market-treemap";

const items = [
  { change: 2.6, label: "NVDA", sector: "Semis", value: 980 },
  { change: 1.4, label: "MSFT", sector: "Software", value: 760 },
  { change: -1.4, label: "XOM", sector: "Energy", value: 520 },
  { change: 0.8, label: "JPM", sector: "Financials", value: 440 },
  { change: -0.9, label: "LLY", sector: "Healthcare", value: 400 },
  { change: 3.2, label: "AMD", sector: "Semis", value: 360 },
];

test.describe("MarketTreemap", () => {
  test("default", async ({ mount }) => {
    const component = await mount(
      <div className="w-[920px] p-6">
        <MarketTreemap items={items} />
      </div>,
    );

    await expect(component).toHaveScreenshot();
  });
});
