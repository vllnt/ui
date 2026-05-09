import { expect, test } from "@playwright/experimental-ct-react";

import {
  type ChoroplethRegion,
  ChoroplethLegend,
  ChoroplethMap,
  ChoroplethTooltip,
} from "./choropleth-map";

const REGIONS: ChoroplethRegion[] = [
  {
    coordinates: [
      [-5, 51],
      [10, 51],
      [10, 41],
      [-5, 41],
      [-5, 51],
    ],
    id: "FR",
    name: "France",
  },
  {
    coordinates: [
      [5, 55],
      [15, 55],
      [15, 47],
      [5, 47],
      [5, 55],
    ],
    id: "DE",
    name: "Germany",
  },
  {
    coordinates: [
      [6, 47],
      [18, 47],
      [18, 37],
      [6, 37],
      [6, 47],
    ],
    id: "IT",
    name: "Italy",
  },
];

const DATA = { DE: 4082, ES: 1397, FR: 2937, IT: 2107 };

test.describe("ChoroplethMap Visual", () => {
  test("default", async ({ mount }) => {
    const component = await mount(
      <ChoroplethMap data={DATA} regions={REGIONS}>
        <ChoroplethTooltip />
        <ChoroplethLegend title="GDP (B USD)" />
      </ChoroplethMap>,
    );
    await expect(component).toHaveScreenshot("choropleth-map-default.png");
  });
});
