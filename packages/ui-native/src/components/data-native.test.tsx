import { fireEvent, render, screen } from "@testing-library/react-native";

import { ActivityLog } from "./activity-log/activity-log";
import { Alert, AlertDescription, AlertTitle } from "./alert/alert";
import { AvatarGroup } from "./avatar-group/avatar-group";
import { CountdownTimer } from "./countdown-timer/countdown-timer";
import { DataList } from "./data-list/data-list";
import { LiveFeed } from "./live-feed/live-feed";
import { MetricCluster } from "./metric-cluster/metric-cluster";
import { OverviewBoard } from "./overview-board/overview-board";
import { PresenceStack } from "./presence-stack/presence-stack";
import { PresenceSyncIndicator } from "./presence-sync-indicator/presence-sync-indicator";
import { ProgressBar } from "./progress-bar/progress-bar";
import { ProgressCard } from "./progress-card/progress-card";
import { SeverityBadge } from "./severity-badge/severity-badge";
import { StatCard } from "./stat-card/stat-card";
import { StatusBoard } from "./status-board/status-board";
import { StatusIndicator } from "./status-indicator/status-indicator";
import { StickyMetric } from "./sticky-metric/sticky-metric";
import { WorldClockBar } from "./world-clock-bar/world-clock-bar";

const fixedNow = "2026-01-01T12:00:00.000Z";

describe("native data and status components", () => {
  it("renders empty and populated caller-keyed data collections", () => {
    const { rerender } = render(<DataList items={[]} />);
    expect(screen.getByText("No data available.")).toBeOnTheScreen();

    rerender(
      <DataList
        items={[
          { id: "region", label: "Region", value: "North America" },
          { id: "owner", label: "Owner", value: "Operations" },
        ]}
      />,
    );

    expect(screen.getByText("Region")).toBeOnTheScreen();
    expect(screen.getByText("Operations")).toBeOnTheScreen();
  });

  it("renders metric summaries without chart or table semantics", () => {
    render(
      <>
        <StatCard change="12%" label="Requests" trend="up" value="1,240" />
        <MetricCluster
          metrics={[{ id: "latency", label: "p95", value: "180 ms" }]}
          offsetX={8}
          offsetY={8}
          title="Runtime"
        />
        <StickyMetric
          detail="per minute"
          label="Errors"
          offsetX={8}
          offsetY={8}
          value="14"
        />
      </>,
    );

    expect(screen.getByText("1,240")).toBeOnTheScreen();
    expect(screen.getByText("180 ms")).toBeOnTheScreen();
    expect(screen.getByText("per minute")).toBeOnTheScreen();
  });

  it("exposes clamped progress values and a pressable progress card", () => {
    const onPress = jest.fn();
    render(
      <>
        <ProgressBar max={10} value={20} />
        <ProgressCard
          description="Learn native layout."
          max={4}
          onPress={onPress}
          tags={[{ id: "native", label: "Native" }]}
          title="Layout course"
          value={2}
        />
      </>,
    );

    expect(screen.getByRole("progressbar", { name: "Complete" })).toHaveProp(
      "accessibilityValue",
      expect.objectContaining({ max: 10, now: 10, text: "100%" }),
    );
    fireEvent.press(screen.getByRole("button", { name: "Layout course" }));
    expect(onPress).toHaveBeenCalledTimes(1);
    expect(screen.getByText("Native")).toBeOnTheScreen();
  });

  it("renders overview and service status data with explicit status text", () => {
    render(
      <>
        <OverviewBoard
          heading="Operations"
          items={[
            {
              description: "Across all regions",
              heading: "Open incidents",
              id: "incidents",
              metric: "2",
              tone: "danger",
            },
          ]}
        />
        <StatusBoard
          items={[
            {
              id: "api",
              label: "API",
              status: "healthy",
              value: "99.99%",
            },
            { id: "queue", label: "Queue", status: "warning" },
          ]}
        />
      </>,
    );

    expect(
      screen.getByRole("header", { name: "Operations" }),
    ).toBeOnTheScreen();
    expect(screen.getByText("1 Healthy")).toBeOnTheScreen();
    expect(screen.getByText("No metric reported")).toBeOnTheScreen();
  });

  it("provides readable status, severity, alert, and sync announcements", () => {
    render(
      <>
        <StatusIndicator label="Operational" tone="success" />
        <SeverityBadge level="critical" />
        <PresenceSyncIndicator state="reconnecting" status="retry 2 of 5" />
        <Alert variant="destructive">
          <AlertTitle>Connection lost</AlertTitle>
          <AlertDescription>Check the network and retry.</AlertDescription>
        </Alert>
      </>,
    );

    expect(screen.getByLabelText("Operational, success")).toBeOnTheScreen();
    expect(screen.getByLabelText("Critical severity")).toBeOnTheScreen();
    expect(
      screen.getByRole("status", {
        name: "Presence sync: Reconnecting, retry 2 of 5",
      }),
    ).toHaveProp("accessibilityLiveRegion", "polite");
    expect(screen.getByRole("alert")).toHaveProp(
      "accessibilityLiveRegion",
      "assertive",
    );
  });

  it("renders deterministic countdown and feed times without real timers", () => {
    render(
      <>
        <CountdownTimer
          deadline="2026-01-01T13:01:02.000Z"
          now={fixedNow}
          warningThresholdMs={30 * 60 * 1000}
        />
        <LiveFeed
          events={[
            {
              id: "older",
              severity: "info",
              timestamp: "2026-01-01T11:00:00.000Z",
              title: "Deploy started",
            },
            {
              id: "latest",
              severity: "critical",
              timestamp: "2026-01-01T11:59:30.000Z",
              title: "Error spike",
            },
          ]}
          now={fixedNow}
        />
      </>,
    );

    expect(
      screen.getByRole("timer", { name: "Countdown timer: On track" }),
    ).toBeOnTheScreen();
    expect(screen.getAllByText("01")).toHaveLength(2);
    expect(screen.getByText("02")).toBeOnTheScreen();
    expect(screen.getByText("30s ago")).toBeOnTheScreen();
    expect(screen.getAllByText("1h ago")).toHaveLength(1);
  });

  it("updates controlled time output through rerendering", () => {
    const { rerender } = render(
      <LiveFeed
        events={[
          {
            id: "event",
            severity: "low",
            timestamp: "2026-01-01T11:59:30.000Z",
            title: "Cache refreshed",
          },
        ]}
        now={fixedNow}
      />,
    );
    expect(screen.getByText("30s ago")).toBeOnTheScreen();

    rerender(
      <LiveFeed
        events={[
          {
            id: "event",
            severity: "low",
            timestamp: "2026-01-01T11:59:30.000Z",
            title: "Cache refreshed",
          },
        ]}
        now="2026-01-01T12:01:30.000Z"
      />,
    );
    expect(screen.getByText("2m ago")).toBeOnTheScreen();
  });

  it("supports activity pagination through native buttons", () => {
    const onPageChange = jest.fn();
    render(
      <ActivityLog
        items={[
          {
            action: "created",
            actor: "Ada",
            id: "one",
            timestamp: "12:00",
          },
          {
            action: "updated",
            actor: "Lin",
            id: "two",
            timestamp: "12:01",
          },
        ]}
        onPageChange={onPageChange}
        pageSize={1}
      />,
    );

    fireEvent.press(screen.getByRole("button", { name: "Next, page 2" }));
    expect(onPageChange).toHaveBeenCalledWith(2);
    expect(screen.getByText("Lin · updated")).toBeOnTheScreen();
  });

  it("renders deterministic zones and participant overflow interactions", () => {
    const onOverflowPress = jest.fn();
    render(
      <>
        <WorldClockBar
          now={fixedNow}
          zones={[{ city: "UTC", id: "utc", locale: "en-GB", timeZone: "UTC" }]}
        />
        <AvatarGroup
          items={[
            { accessibilityLabel: "Ada", fallback: "AD", id: "ada" },
            { accessibilityLabel: "Lin", fallback: "LN", id: "lin" },
          ]}
          max={1}
          overflowLabel={(count) => `${count} hidden avatars`}
        />
        <PresenceStack
          max={1}
          onOverflowPress={onOverflowPress}
          users={[
            { id: "ada", initial: "A", name: "Ada", status: "active" },
            { id: "lin", initial: "L", name: "Lin", status: "away" },
          ]}
        />
      </>,
    );

    expect(screen.getAllByText("UTC")).toHaveLength(2);
    expect(screen.getByLabelText("1 more")).toBeOnTheScreen();
    fireEvent.press(screen.getByRole("button", { name: "1 more" }));
    expect(onOverflowPress).toHaveBeenCalledTimes(1);
  });
});
