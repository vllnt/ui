import { expect, test } from "@playwright/experimental-ct-react";

import {
  type GeoJSONPolygon,
  Map2D,
  MapControls,
  MapLayer,
  MapMarker,
  MapZoomIn,
  MapZoomOut,
} from "./map-2d";

const FRANCE: GeoJSONPolygon = {
  coordinates: [
    [-5, 51],
    [10, 51],
    [10, 41],
    [-5, 41],
    [-5, 51],
  ],
  id: "france-bbox",
  type: "polygon",
};

test.describe("Map2D Visual", () => {
  test("default", async ({ mount }) => {
    const component = await mount(
      <Map2D center={[2, 48]} zoom={2}>
        <MapLayer data={[FRANCE]} />
        <MapMarker popup="Paris" position={[2.35, 48.85]} />
        <MapMarker popup="London" position={[-0.13, 51.5]} />
        <MapMarker popup="Berlin" position={[13.4, 52.52]} />
        <MapControls>
          <MapZoomIn />
          <MapZoomOut />
        </MapControls>
      </Map2D>,
    );
    await expect(component).toHaveScreenshot("map-2d-default.png");
  });
});
