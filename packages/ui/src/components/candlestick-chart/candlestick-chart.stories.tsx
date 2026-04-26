import type { Meta, StoryObj } from "@storybook/react-vite";

import { CandlestickChart } from "./candlestick-chart";

const sampleData = [
  { close: 189.8, high: 191.2, label: "Mon", low: 182.4, open: 184.6 },
  { close: 186.1, high: 193.5, label: "Tue", low: 184.8, open: 190.3 },
  { close: 194.6, high: 196.8, label: "Wed", low: 185.9, open: 186.5 },
  { close: 197.2, high: 199.4, label: "Thu", low: 192.7, open: 194.8 },
  { close: 193.4, high: 198.1, label: "Fri", low: 191.3, open: 197.7 },
  { close: 198.5, high: 201.1, label: "Sat", low: 192.4, open: 193.6 },
];

const meta = {
  args: {
    data: sampleData,
  },
  component: CandlestickChart,
  title: "Data/CandlestickChart",
} satisfies Meta<typeof CandlestickChart>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Compact: Story = {
  args: {
    height: 220,
    width: 560,
  },
};
