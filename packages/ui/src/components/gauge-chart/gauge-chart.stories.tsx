import type { Meta, StoryObj } from "@storybook/react-vite";

import { GaugeChart } from "./gauge-chart";

const meta = {
  args: {
    className: "text-primary",
    label: "CPU load",
    max: 100,
    min: 0,
    size: 220,
    value: 72,
  },
  component: GaugeChart,
  title: "Data/GaugeChart",
} satisfies Meta<typeof GaugeChart>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Empty: Story = {
  args: { label: "Idle", value: 0 },
};

export const Full: Story = {
  args: { label: "Capacity", value: 100 },
};
