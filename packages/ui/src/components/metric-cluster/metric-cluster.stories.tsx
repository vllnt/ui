import type { Meta, StoryObj } from "@storybook/react-vite";

import { MetricCluster } from "./metric-cluster";

const meta = {
  args: {
    anchor: "top-right",
    metrics: [
      { id: "qps", label: "qps", tone: "success", value: "240" },
      { id: "errs", label: "errs", tone: "danger", value: "14" },
      { id: "p95", label: "p95", value: "180ms" },
    ],
    title: "research-2025",
    x: 200,
    y: 100,
  },
  component: MetricCluster,
  decorators: [
    (Story) => (
      <div
        className="relative bg-muted/30"
        style={{ height: 280, width: 360 }}
      >
        <div
          className="absolute rounded-md border border-border bg-background"
          style={{ height: 80, left: 80, top: 80, width: 160 }}
        />
        <Story />
      </div>
    ),
  ],
  title: "Canvas/MetricCluster",
} satisfies Meta<typeof MetricCluster>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Untitled: Story = {
  args: { title: undefined },
};

export const BottomLeft: Story = {
  args: {
    anchor: "bottom-left",
    x: 80,
    y: 160,
  },
};

export const Healthy: Story = {
  args: {
    metrics: [
      { id: "qps", label: "qps", tone: "success", value: "240" },
      { id: "errs", label: "errs", tone: "success", value: "0" },
      { id: "p95", label: "p95", tone: "success", value: "85ms" },
    ],
  },
};
