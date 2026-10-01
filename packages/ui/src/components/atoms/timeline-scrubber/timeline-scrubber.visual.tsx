import { expect, test } from "@playwright/experimental-ct-react";

import { TimelineScrubber } from "./timeline-scrubber";

test.describe("TimelineScrubber Visual", () => {
  test("default", async ({ mount }) => {
    const component = await mount(
      <div className="w-72 bg-muted/30 p-4">
        <TimelineScrubber
          end={3600}
          formatValue={(v) => `${Math.round(v / 60)}m`}
          onValueChange={() => undefined}
          start={0}
          ticks={[
            { id: "deploy", tone: "primary", value: 600 },
            { id: "alert", tone: "danger", value: 2400 },
          ]}
          value={1800}
        />
      </div>,
    );
    await expect(component).toHaveScreenshot(
      "timeline-scrubber-default.png",
    );
  });
});
