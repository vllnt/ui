import type { Meta, StoryObj } from "@storybook/react-vite";

import { ShimmerButton } from "./shimmer-button";

const meta = {
  args: {
    children: "Get started",
  },
  component: ShimmerButton,
  title: "Effects/ShimmerButton",
} satisfies Meta<typeof ShimmerButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Slow: Story = {
  args: {
    shimmerDuration: 4,
  },
};
