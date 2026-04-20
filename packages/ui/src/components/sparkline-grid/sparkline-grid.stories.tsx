import type { Meta, StoryObj } from "@storybook/react-vite";

import { SparklineGrid } from "./sparkline-grid";

const sampleItems = [
  {
    change: 2.14,
    data: [14, 16, 17, 15, 19, 22],
    label: "Tech momentum",
    value: "$12.8M",
  },
  {
    change: -1.08,
    data: [9, 8, 7, 8, 6, 5],
    label: "Energy breadth",
    value: "$8.4M",
  },
  {
    change: 0.86,
    data: [11, 11, 12, 13, 12, 14],
    label: "Rates pulse",
    value: "$6.1M",
  },
  {
    change: 3.72,
    data: [6, 8, 10, 11, 14, 18],
    label: "AI leaders",
    value: "$15.7M",
  },
];

const meta = {
  args: {
    items: sampleItems,
  },
  component: SparklineGrid,
  title: "Data/SparklineGrid",
} satisfies Meta<typeof SparklineGrid>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const FourColumns: Story = {
  args: {
    columns: 4,
  },
};
