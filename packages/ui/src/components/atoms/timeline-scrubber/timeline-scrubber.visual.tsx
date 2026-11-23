import { expect, test } from "@playwright/experimental-ct-react";

import { TimelineScrubberPreview } from "./timeline-scrubber.visual.fixture";

test.describe("TimelineScrubber Visual", () => {
  test("default", async ({ mount }) => {
    const component = await mount(<TimelineScrubberPreview />);
    await expect(component).toHaveScreenshot(
      "timeline-scrubber-default.png",
    );
  });
});
