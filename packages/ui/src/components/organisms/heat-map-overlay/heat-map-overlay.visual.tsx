import { expect, test } from "@playwright/experimental-ct-react";

import { type HeatMapPoint, HeatMapOverlay } from "./heat-map-overlay";

const POINTS: HeatMapPoint[] = [
  { id: "ny", lat: 40.7, lng: -74, weight: 0.95 },
  { id: "ldn", lat: 51.5, lng: -0.13, weight: 0.7 },
  { id: "par", lat: 48.85, lng: 2.35, weight: 0.6 },
  { id: "tok", lat: 35.7, lng: 139.7, weight: 0.85 },
  { id: "syd", lat: -33.9, lng: 151.2, weight: 0.5 },
  { id: "rio", lat: -22.9, lng: -43.2, weight: 0.45 },
  { id: "lag", lat: 6.5, lng: 3.4, weight: 0.55 },
  { id: "mum", lat: 19.07, lng: 72.87, weight: 0.7 },
];

test.describe("HeatMapOverlay Visual", () => {
  test("default", async ({ mount }) => {
    const component = await mount(
      <HeatMapOverlay data={POINTS} radius={50}>
        <p className="font-medium">Global activity</p>
        <p className="text-muted-foreground">8 hotspots</p>
      </HeatMapOverlay>,
    );
    await expect(component).toHaveScreenshot(
      "heat-map-overlay-default.png",
    );
  });
});
