import type { Meta, StoryObj } from "@storybook/react-vite";

import { AreaChart } from "./area-chart";

const meta = {
  args: {
    data: [
      { label: "Jan", value: 10 },
      { label: "Feb", value: 25 },
      { label: "Mar", value: 18 },
      { label: "Apr", value: 32 },
    ],
    height: 200,
    width: 400,
  },
  component: AreaChart,
  title: "Data/AreaChart",
} satisfies Meta<typeof AreaChart>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
