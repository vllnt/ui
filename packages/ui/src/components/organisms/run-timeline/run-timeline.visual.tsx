import { expect, test } from "@playwright/experimental-ct-react";

import { RunTimelinePreview } from "./run-timeline.visual.fixture";

test.describe("RunTimeline Visual", () => {
  test("default", async ({ mount }) => {
    const component = await mount(<RunTimelinePreview />);
    await expect(component).toHaveScreenshot("run-timeline-default.png");
  });
});
