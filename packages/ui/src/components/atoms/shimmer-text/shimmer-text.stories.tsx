import type { Meta, StoryObj } from "@storybook/react-vite";

import { withWrapper } from "../../../../.storybook/decorators";

import { ShimmerText } from "./shimmer-text";

const meta = {
  args: {
    children: "Loading your workspace",
  },
  component: ShimmerText,
  decorators: [withWrapper("bg-background p-8 text-2xl font-medium")],
  title: "Effects/ShimmerText",
} satisfies Meta<typeof ShimmerText>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Fast: Story = { args: { duration: 1.5 } };
