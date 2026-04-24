import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { LiveFeed, type LiveFeedEvent } from "./live-feed";

const events: LiveFeedEvent[] = [
  {
    id: "a",
    message: "Gateway p95 above SLA",
    severity: "critical",
    source: "pagerduty",
    timestamp: "2026-03-15T11:59:30.000Z",
    title: "Latency breach",
  },
  {
    id: "b",
    severity: "low",
    timestamp: "2026-03-15T11:40:00.000Z",
    title: "Rollback succeeded",
  },
];

describe("LiveFeed", () => {
  it("renders events sorted newest first with relative times", () => {
    render(
      <LiveFeed events={events} now="2026-03-15T12:00:00.000Z" title="Feed" />,
    );

    expect(screen.getByText("Feed")).toBeInTheDocument();
    expect(screen.getByText("Latency breach")).toBeInTheDocument();
    expect(screen.getByText("Rollback succeeded")).toBeInTheDocument();
    expect(screen.getByText("30s ago")).toBeInTheDocument();
    expect(screen.getByText("20m ago")).toBeInTheDocument();
  });

  it("renders an empty state when no events are provided", () => {
    render(
      <LiveFeed
        emptyLabel="Feed quiet"
        events={[]}
        now="2026-03-15T12:00:00.000Z"
      />,
    );

    expect(screen.getByText("Feed quiet")).toBeInTheDocument();
  });

  it("caps the number of rendered events by maxItems", () => {
    const many: LiveFeedEvent[] = Array.from({ length: 5 }, (_, index) => ({
      id: `e-${index}`,
      severity: "info",
      timestamp: new Date(
        Date.parse("2026-03-15T11:00:00.000Z") + index * 60_000,
      ),
      title: `Event ${index}`,
    }));

    render(
      <LiveFeed events={many} maxItems={2} now="2026-03-15T12:00:00.000Z" />,
    );

    expect(screen.getByText("Event 4")).toBeInTheDocument();
    expect(screen.getByText("Event 3")).toBeInTheDocument();
    expect(screen.queryByText("Event 0")).not.toBeInTheDocument();
  });
});
