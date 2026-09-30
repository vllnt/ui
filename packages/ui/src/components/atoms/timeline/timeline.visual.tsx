import { expect, test } from "@playwright/experimental-ct-react";

import { Timeline, TimelineItem } from "./timeline";

test.describe("Timeline Visual", () => {
  test("vertical", async ({ mount }) => {
    const component = await mount(
      <div style={{ width: 320 }}>
        <Timeline>
          <TimelineItem
            date="Jan 2026"
            description="Initial planning and team formation."
            status="completed"
            title="Project started"
          />
          <TimelineItem
            date="Mar 2026"
            description="First version shipped to beta users."
            status="completed"
            title="MVP launch"
          />
          <TimelineItem
            date="Jul 2026"
            description="Major redesign with new features."
            status="active"
            title="V2 release"
          />
          <TimelineItem
            date="Q4 2026"
            description="General availability."
            isLast
            status="upcoming"
            title="Public release"
          />
        </Timeline>
      </div>,
    );
    await expect(component).toHaveScreenshot("timeline-vertical.png");
  });

  test("horizontal", async ({ mount }) => {
    const component = await mount(
      <div style={{ width: 720 }}>
        <Timeline orientation="horizontal">
          <TimelineItem date="Jan" status="completed" title="Plan" />
          <TimelineItem date="Mar" status="completed" title="Build" />
          <TimelineItem date="Jul" status="active" title="Test" />
          <TimelineItem date="Oct" isLast status="upcoming" title="Ship" />
        </Timeline>
      </div>,
    );
    await expect(component).toHaveScreenshot("timeline-horizontal.png");
  });
});
