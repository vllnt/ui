import { expect, test } from "@playwright/experimental-ct-react";

import { CandlestickChart } from "./candlestick-chart";

const data = [
  { close: 189.8, high: 191.2, label: "Mon", low: 182.4, open: 184.6 },
  { close: 186.1, high: 193.5, label: "Tue", low: 184.8, open: 190.3 },
  { close: 194.6, high: 196.8, label: "Wed", low: 185.9, open: 186.5 },
  { close: 197.2, high: 199.4, label: "Thu", low: 192.7, open: 194.8 },
  { close: 193.4, high: 198.1, label: "Fri", low: 191.3, open: 197.7 },
];

test.describe("CandlestickChart", () => {
  test("default", async ({ mount }) => {
    const component = await mount(
      <div className="w-[860px] p-6">
        <CandlestickChart data={data} />
      </div>,
    );

    await expect(component).toHaveScreenshot();
  });
});
