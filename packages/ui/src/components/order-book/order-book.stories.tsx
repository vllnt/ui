import type { Meta, StoryObj } from "@storybook/react-vite";

import { OrderBook } from "./order-book";

const headingTagOptions = ["h1", "h2", "h3", "h4", "h5", "h6"] as const;

const sampleAsks = [
  { price: 185.24, size: 4.2 },
  { price: 185.31, size: 6.8 },
  { price: 185.39, size: 8.1 },
  { price: 185.46, size: 10.4 },
  { price: 185.53, size: 11.7 },
];

const sampleBids = [
  { price: 185.18, size: 5.4 },
  { price: 185.11, size: 7.1 },
  { price: 185.03, size: 9.2 },
  { price: 184.96, size: 10.1 },
  { price: 184.88, size: 12.9 },
];

const meta = {
  args: {
    asks: sampleAsks,
    bids: sampleBids,
  },
  argTypes: {
    as: {
      control: "select",
      description: "Override the rendered heading tag.",
      options: headingTagOptions,
    },
  },
  component: OrderBook,
  title: "Data/OrderBook",
} satisfies Meta<typeof OrderBook>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const TightSpread: Story = {
  args: {
    asks: sampleAsks.map((level) => ({ ...level, price: level.price - 0.02 })),
  },
};

export const HeadingOverride: Story = {
  args: {
    as: "h2",
  },
};
