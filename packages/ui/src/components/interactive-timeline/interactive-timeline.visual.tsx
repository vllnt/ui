import { expect, test } from "@playwright/experimental-ct-react";

import {
  InteractiveTimeline,
  InteractiveTimelineFilter,
  InteractiveTimelineToday,
  InteractiveTimelineToolbar,
  InteractiveTimelineZoomIn,
  InteractiveTimelineZoomOut,
} from "./interactive-timeline";

const TRACKS = [
  { color: "blue" as const, id: "release", label: "Releases" },
  { color: "red" as const, id: "incident", label: "Incidents" },
  { color: "emerald" as const, id: "feature", label: "Features" },
];

const CATEGORIES = [
  { color: "blue" as const, id: "release", label: "Release" },
  { color: "red" as const, id: "incident", label: "Incident" },
  { color: "emerald" as const, id: "feature", label: "Feature" },
];

const EVENTS = [
  {
    category: "release",
    id: "v1",
    startDate: new Date("2024-06-01"),
    title: "v1.0",
    track: "release",
  },
  {
    category: "release",
    id: "v2",
    startDate: new Date("2024-12-15"),
    title: "v2.0",
    track: "release",
  },
  {
    category: "incident",
    endDate: new Date("2024-08-12"),
    id: "incident-1",
    startDate: new Date("2024-08-10"),
    title: "Outage",
    track: "incident",
  },
  {
    category: "feature",
    endDate: new Date("2024-10-20"),
    id: "search",
    startDate: new Date("2024-09-01"),
    title: "Global search",
    track: "feature",
  },
];

test.describe("InteractiveTimeline Visual", () => {
  test("default", async ({ mount }) => {
    const component = await mount(
      <InteractiveTimeline
        categories={CATEGORIES}
        endDate={new Date("2025-01-01")}
        events={EVENTS}
        startDate={new Date("2024-01-01")}
        tracks={TRACKS}
      >
        <InteractiveTimelineToolbar>
          <InteractiveTimelineZoomIn />
          <InteractiveTimelineZoomOut />
          <InteractiveTimelineToday />
          <InteractiveTimelineFilter categories={CATEGORIES} />
        </InteractiveTimelineToolbar>
      </InteractiveTimeline>,
    );
    await expect(component).toHaveScreenshot(
      "interactive-timeline-default.png",
    );
  });
});
