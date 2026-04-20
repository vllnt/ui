import { expect, test } from "@playwright/experimental-ct-react";

import { LiveFeed, type LiveFeedEvent } from "./live-feed";

const events: LiveFeedEvent[] = [
  {
    id: "1",
    message: "Auth gateway p95 latency above 400ms for 5m.",
    severity: "critical",
    source: "pagerduty",
    timestamp: "2026-03-15T11:59:30.000Z",
    title: "Latency breach on gateway",
  },
  {
    id: "2",
    message: "Auto-scaler added 2 nodes to worker pool.",
    severity: "medium",
    source: "platform",
    timestamp: "2026-03-15T11:55:00.000Z",
    title: "Worker pool scaled up",
  },
  {
    id: "3",
    message: "Revert complete. SLA within target.",
    severity: "low",
    source: "deploy-bot",
    timestamp: "2026-03-15T11:40:00.000Z",
    title: "Rollback of v7.1.2 succeeded",
  },
];

test.describe("LiveFeed Visual", () => {
  test("default", async ({ mount, page }) => {
    await mount(
      <div style={{ maxWidth: 520, padding: 16 }}>
        <LiveFeed
          events={events}
          now="2026-03-15T12:00:00.000Z"
          title="Incident feed"
        />
      </div>,
    );
    await expect(page).toHaveScreenshot("live-feed-default.png");
  });
});
