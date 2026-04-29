import type { Meta, StoryObj } from "@storybook/react-vite";

import { MetricGauge } from "./metric-gauge";

const meta = {
  args: {
    description: "Live CPU saturation against the current autoscaling budget.",
    label: "CPU load",
    max: 100,
    unit: "%",
    value: 72,
  },
  component: MetricGauge,
  title: "Data/MetricGauge",
} satisfies Meta<typeof MetricGauge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Critical: Story = {
  args: {
    value: 94,
  },
};
