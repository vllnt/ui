import { expect, test } from "@playwright/experimental-ct-react";

import { RunTimeline } from "./run-timeline";

test.describe("RunTimeline Visual", () => {
  test("default", async ({ mount }) => {
    const component = await mount(
      <div className="bg-muted/30 p-4" style={{ width: 540 }}>
        <RunTimeline
          cursor={1800}
          end={3600}
          formatValue={(v) => `${Math.round(v / 60)}m`}
          lanes={[
            { id: "ingest", label: "Ingest" },
            { id: "rank", label: "Rank" },
            { id: "emit", label: "Emit" },
          ]}
          phases={[
            { end: 600, id: "i1", label: "load", laneId: "ingest", start: 0, state: "complete" },
            { end: 720, id: "i2", label: "tag", laneId: "ingest", start: 600, state: "complete" },
            { end: 2200, id: "r1", label: "score", laneId: "rank", start: 800, state: "running" },
            { end: 1500, id: "r2", label: "filter", laneId: "rank", start: 1200, state: "failed" },
            { end: 3600, id: "e1", label: "publish", laneId: "emit", start: 2300, state: "queued" },
          ]}
          start={0}
        />
      </div>,
    );
    await expect(component).toHaveScreenshot("run-timeline-default.png");
  });
});
