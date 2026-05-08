import { expect, test } from "@playwright/experimental-ct-react";

import {
  ParallelTimeline,
  type ParallelTimelineTrack,
} from "./parallel-timeline";

const TRACKS: ParallelTimelineTrack[] = [
  {
    color: "red",
    events: [
      { id: "augustus", title: "Augustus", year: -27 },
      { id: "fall", title: "Fall of Rome", year: 476 },
    ],
    id: "rome",
    name: "Rome",
    region: "Mediterranean",
  },
  {
    color: "amber",
    events: [
      { id: "qin", title: "Qin unifies China", year: -221 },
      { id: "han-end", title: "End of Han", year: 220 },
    ],
    id: "china",
    name: "China",
    region: "East Asia",
  },
  {
    color: "emerald",
    events: [
      { id: "maurya", title: "Maurya founded", year: -322 },
      { id: "gupta", title: "Gupta begins", year: 320 },
    ],
    id: "india",
    name: "India",
    region: "South Asia",
  },
];

test.describe("ParallelTimeline Visual", () => {
  test("default", async ({ mount }) => {
    const component = await mount(
      <ParallelTimeline
        endYear={500}
        eras={[
          {
            color: "neutral",
            end: 500,
            id: "antiquity",
            name: "Antiquity",
            start: -500,
          },
        ]}
        startYear={-500}
        tracks={TRACKS}
      />,
    );
    await expect(component).toHaveScreenshot(
      "parallel-timeline-default.png",
    );
  });
});
