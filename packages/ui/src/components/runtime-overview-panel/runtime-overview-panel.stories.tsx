import type { Meta, StoryObj } from "@storybook/react-vite";

import { RuntimeOverviewPanel } from "./runtime-overview-panel";

const meta = {
  args: {
    metrics: [
      { id: "runs", label: "Active runs", tone: "success", trend: "up", value: 3 },
      {
        detail: "0 last hour",
        id: "errs",
        label: "Errors",
        tone: "neutral",
        trend: "flat",
        value: 0,
      },
      {
        id: "tps",
        label: "Throughput",
        tone: "success",
        trend: "up",
        value: "120 / s",
      },
      {
        detail: "p95 240ms",
        id: "lat",
        label: "Latency",
        tone: "warn",
        trend: "down",
        value: "180ms",
      },
    ],
  },
  component: RuntimeOverviewPanel,
  decorators: [
    (Story) => (
      <div className="w-72">
        <Story />
      </div>
    ),
  ],
  title: "Canvas/RuntimeOverviewPanel",
} satisfies Meta<typeof RuntimeOverviewPanel>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Empty: Story = {
  args: { metrics: [] },
};

export const AllHealthy: Story = {
  args: {
    metrics: [
      { id: "runs", label: "Active runs", tone: "success", value: 5 },
      { id: "errs", label: "Errors", tone: "success", value: 0 },
      { id: "tps", label: "Throughput", tone: "success", value: "240 / s" },
      { id: "lat", label: "Latency", tone: "success", value: "85ms" },
    ],
  },
};

export const Degraded: Story = {
  args: {
    metrics: [
      {
        detail: "queue backed up",
        id: "runs",
        label: "Active runs",
        tone: "warn",
        value: 12,
      },
      {
        detail: "rate-limit hit",
        id: "errs",
        label: "Errors",
        tone: "danger",
        trend: "up",
        value: 14,
      },
      {
        id: "tps",
        label: "Throughput",
        tone: "warn",
        trend: "down",
        value: "60 / s",
      },
      {
        detail: "p95 1.2s",
        id: "lat",
        label: "Latency",
        tone: "danger",
        trend: "up",
        value: "880ms",
      },
    ],
  },
};
