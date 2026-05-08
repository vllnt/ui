import { expect, test } from "@playwright/experimental-ct-react";

import {
  MapTimeline,
  MapTimelineControls,
  MapTimelineEvent,
  MapTimelineLayer,
  MapTimelinePlayButton,
  MapTimelineSlider,
} from "./map-timeline";

const ROMAN_RING: [number, number][] = [
  [-9, 56],
  [10, 56],
  [40, 50],
  [40, 30],
  [10, 30],
  [-9, 36],
  [-9, 56],
];

const BYZANTINE_RING: [number, number][] = [
  [10, 45],
  [42, 45],
  [42, 30],
  [10, 30],
  [10, 45],
];

test.describe("MapTimeline Visual", () => {
  test("default", async ({ mount }) => {
    const component = await mount(
      <MapTimeline endYear={2025} initialYear={400} startYear={-500}>
        <MapTimelineLayer
          color="red"
          endYear={476}
          geometry={{ polygon: ROMAN_RING, type: "polygon" }}
          id="rome"
          label="Roman Empire"
          startYear={-27}
        />
        <MapTimelineLayer
          color="purple"
          endYear={1453}
          geometry={{ polygon: BYZANTINE_RING, type: "polygon" }}
          id="byzantium"
          label="Byzantine Empire"
          startYear={330}
        />
        <MapTimelineEvent
          color="amber"
          description="Pompeii destroyed"
          id="vesuvius"
          position={[14.48, 40.75]}
          title="Vesuvius"
          toleranceYears={400}
          year={79}
        />
        <MapTimelineControls>
          <MapTimelinePlayButton />
          <MapTimelineSlider />
        </MapTimelineControls>
      </MapTimeline>,
    );
    await expect(component).toHaveScreenshot("map-timeline-default.png");
  });
});
