import type { Meta, StoryObj } from "@storybook/react-vite";

import { MarketTreemap } from "./market-treemap";

const headingTagOptions = ["h1", "h2", "h3", "h4", "h5", "h6"] as const;

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
  argTypes: {
    as: {
      control: "select",
      description: "Override the rendered heading tag.",
      options: headingTagOptions,
    },
  },
  component: MarketTreemap,
  title: "Data/MarketTreemap",
} satisfies Meta<typeof MarketTreemap>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const HeadingOverride: Story = {
  args: {
    as: "h2",
  },
};
