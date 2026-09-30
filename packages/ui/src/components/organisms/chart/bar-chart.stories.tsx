import type { Meta, StoryObj } from "@storybook/react-vite";

import { BarChart } from "./bar-chart";

const meta = {
  args: {
    className: "text-primary",
    data: [
      { label: "Jan", value: 10 },
      { label: "Feb", value: 25 },
      { label: "Mar", value: 18 },
      { label: "Apr", value: 32 },
      { label: "May", value: 21 },
    ],
    height: 160,
    width: 360,
  },
  component: BarChart,
  title: "Data/BarChart",
} satisfies Meta<typeof BarChart>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
