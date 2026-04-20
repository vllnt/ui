import type { Meta, StoryObj } from "@storybook/react-vite";

import { TickerTape } from "./ticker-tape";

const sampleItems = [
  { change: 1.42, price: 182.33, symbol: "AAPL", volume: "Vol 32M" },
  { change: -0.64, price: 431.8, symbol: "MSFT", volume: "Vol 18M" },
  { change: 3.08, price: 512.9, symbol: "NVDA", volume: "Vol 44M" },
  { change: -1.18, price: 287.12, symbol: "TSLA", volume: "Vol 51M" },
  { change: 0.54, price: 171.4, symbol: "AMD", volume: "Vol 27M" },
];

const meta = {
  args: {
    items: sampleItems,
  },
  component: TickerTape,
  title: "Data/TickerTape",
} satisfies Meta<typeof TickerTape>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Fast: Story = {
  args: {
    speedSeconds: 18,
  },
};
