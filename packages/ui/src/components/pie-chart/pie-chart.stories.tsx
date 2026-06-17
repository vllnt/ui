import type { Meta, StoryObj } from "@storybook/react-vite";

import { PieChart } from "./pie-chart";

const meta = {
  args: {
    className: "text-primary",
    data: [
      { label: "Direct", value: 40 },
      { label: "Referral", value: 25 },
      { label: "Organic", value: 35 },
      { label: "Social", value: 18 },
    ],
    size: 220,
  },
  component: PieChart,
  title: "Data/PieChart",
} satisfies Meta<typeof PieChart>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Donut: Story = {
  args: { innerRadius: 0.6 },
};

export const CustomPalette: Story = {
  args: {
    colors: ["#6366f1", "#22c55e", "#f59e0b", "#ef4444"],
  },
};
