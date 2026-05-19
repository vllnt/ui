import type { Meta, StoryObj } from "@storybook/react-vite";

import { Watchlist } from "./watchlist";

const headingTagOptions = ["h1", "h2", "h3", "h4", "h5", "h6"] as const;

const sampleItems = [
  {
    change: 1.42,
    name: "Apple Inc.",
    price: 182.33,
    starred: true,
    symbol: "AAPL",
    volume: "Vol 32M",
  },
  {
    change: -0.64,
    name: "Microsoft Corp.",
    price: 431.8,
    symbol: "MSFT",
    volume: "Vol 18M",
  },
  {
    change: 3.08,
    name: "NVIDIA",
    price: 512.9,
    starred: true,
    symbol: "NVDA",
    volume: "Vol 44M",
  },
  {
    change: -1.18,
    name: "Tesla",
    price: 287.12,
    symbol: "TSLA",
    volume: "Vol 51M",
  },
  {
    change: 0.54,
    name: "Advanced Micro Devices",
    price: 171.4,
    symbol: "AMD",
    volume: "Vol 27M",
  },
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
  component: Watchlist,
  title: "Data/Watchlist",
} satisfies Meta<typeof Watchlist>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Compact: Story = {
  args: {
    items: sampleItems.slice(0, 3),
    title: "Top movers",
  },
};

export const HeadingOverride: Story = {
  args: {
    as: "h2",
  },
};
