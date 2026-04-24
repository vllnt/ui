import type { Meta, StoryObj } from "@storybook/react-vite";

import { NumberTicker } from "./number-ticker";

const meta = {
  args: {
    duration: 1.4,
    value: 12840,
  },
  component: NumberTicker,
  title: "Utility/NumberTicker",
} satisfies Meta<typeof NumberTicker>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const DecimalValue: Story = {
  args: {
    formatOptions: {
      maximumFractionDigits: 1,
      minimumFractionDigits: 1,
    },
    value: 98.6,
  },
};
