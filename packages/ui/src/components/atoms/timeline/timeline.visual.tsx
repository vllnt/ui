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

  test("status labels", async ({ mount }) => {
    const component = await mount(
      <div style={{ width: 320 }}>
        <Timeline
          labels={{ active: "En cours", completed: "Terminé", upcoming: "À venir" }}
        >
          <TimelineItem date="Jan" status="completed" title="Plan" />
          <TimelineItem date="Mar" status="active" title="Build" />
          <TimelineItem date="Jul" isLast status="upcoming" title="Ship" />
        </Timeline>
      </div>,
    );
    for (const word of ["Terminé", "En cours", "À venir"]) {
      await expect(component.getByText(word)).toBeAttached();
    }
    await expect(component).toHaveScreenshot("timeline-status-labels.png");
  });

  test("mobile 390", async ({ mount, page }) => {
    const errors: string[] = [];
    page.on("console", (message) => {
      if (message.type() === "error") errors.push(message.text());
    });
    page.on("pageerror", (error) => errors.push(String(error)));
    await page.setViewportSize({ width: 390, height: 844 });
    await mount(
      <Timeline>
        <TimelineItem
          date="Jan 2026"
          description="Initial planning and team formation."
          status="completed"
          title="Project started"
        />
        <TimelineItem
          date="Jul 2026"
          description="Major redesign with new features."
          status="active"
          title="V2 release"
        />
        <TimelineItem isLast status="upcoming" title="Public release" />
      </Timeline>,
    );
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
    await expect(page).toHaveScreenshot("timeline-mobile.png");
    expect(errors).toEqual([]);
  });
});
