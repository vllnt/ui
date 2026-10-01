import type { Meta, StoryObj } from "@storybook/react-vite";

import { LineChart } from "./line-chart";

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
  component: LineChart,
  title: "Data/LineChart",
} satisfies Meta<typeof LineChart>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
