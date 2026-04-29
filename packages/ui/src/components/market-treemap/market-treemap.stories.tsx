import type { Meta, StoryObj } from "@storybook/react-vite";

import { MarketTreemap } from "./market-treemap";

const sampleItems = [
  { change: 2.6, label: "NVDA", sector: "Semis", value: 980 },
  { change: 1.4, label: "MSFT", sector: "Software", value: 760 },
  { change: -1.4, label: "XOM", sector: "Energy", value: 520 },
  { change: 0.8, label: "JPM", sector: "Financials", value: 440 },
  { change: -0.9, label: "LLY", sector: "Healthcare", value: 400 },
  { change: 3.2, label: "AMD", sector: "Semis", value: 360 },
];

const meta = {
  args: {
    items: sampleItems,
  },
  component: MarketTreemap,
  title: "Data/MarketTreemap",
} satisfies Meta<typeof MarketTreemap>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
