import { expect, test } from "@playwright/experimental-ct-react";

import { Globe3D, GlobeArc, GlobeMarker } from "./globe-3d";

test.describe("Globe3D Visual", () => {
  test("default", async ({ mount }) => {
    const component = await mount(
      <Globe3D autoRotate={false} initialPosition={{ lat: 30, lng: -30 }}>
        <GlobeMarker color="blue" id="paris" label="Paris" lat={48.85} lng={2.35} />
        <GlobeMarker color="red" id="ny" label="New York" lat={40.71} lng={-74} />
        <GlobeMarker
          color="emerald"
          id="rio"
          label="Rio"
          lat={-22.9}
          lng={-43.2}
        />
        <GlobeArc
          color="cyan"
          from={{ lat: 48.85, lng: 2.35 }}
          id="paris-ny"
          to={{ lat: 40.71, lng: -74 }}
        />
      </Globe3D>,
    );
    await expect(component).toHaveScreenshot("globe-3d-default.png");
  });
});
