import type { Meta, StoryObj } from "@storybook/react-vite";

import { AreaChart } from "./area-chart";

const meta = {
  component: AreaChart,
  title: "Components/AreaChart",
} satisfies Meta<typeof AreaChart>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
