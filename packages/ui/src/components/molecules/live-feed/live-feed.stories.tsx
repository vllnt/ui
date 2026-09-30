import type { Meta, StoryObj } from "@storybook/react-vite";

import { LiveFeed } from "./live-feed";

const meta = {
  args: {
    description: "Rolling stream of operational signals, alerts, and deploys.",
    events: [
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
      {
        id: "4",
        severity: "info",
        source: "release",
        timestamp: "2026-03-15T10:00:00.000Z",
        title: "Release window opened",
      },
    ],
    now: "2026-03-15T12:00:00.000Z",
    title: "Incident feed",
  },
  component: LiveFeed,
  title: "Data/LiveFeed",
} satisfies Meta<typeof LiveFeed>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Empty: Story = {
  args: {
    events: [],
  },
};
