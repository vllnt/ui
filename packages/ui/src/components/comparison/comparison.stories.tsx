import type { Meta, StoryObj } from "@storybook/react-vite";

import { Comparison } from "./comparison";

const meta = {
  args: {
    children: "Comparison",
  },
  component: Comparison,
  title: "Data/Comparison",
} satisfies Meta<typeof Comparison>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
