import { expect, test } from "@playwright/experimental-ct-react";

import { type RouteWaypoint, RouteMap } from "./route-map";

const SILK_ROAD: RouteWaypoint[] = [
  { id: "chang", label: "Chang'an", position: [108.94, 34.34] },
  { id: "kashgar", label: "Kashgar", position: [75.99, 39.47] },
  { id: "samarkand", label: "Samarkand", position: [66.97, 39.65] },
  { id: "constantinople", label: "Constantinople", position: [28.98, 41.01] },
];

test.describe("RouteMap Visual", () => {
  test("default", async ({ mount }) => {
    const component = await mount(
      <RouteMap color="red" lineStyle="dashed" waypoints={SILK_ROAD}>
        <p className="font-medium">Silk Road</p>
        <p className="text-muted-foreground">4 waypoints · 7,500 km</p>
      </RouteMap>,
    );
    await expect(component).toHaveScreenshot("route-map-default.png");
  });
});
