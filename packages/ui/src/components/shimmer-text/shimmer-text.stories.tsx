import type { Meta, StoryObj } from "@storybook/react-vite";

import { ShimmerText } from "./shimmer-text";

const meta = {
  args: {
    children: "Loading your workspace",
  },
  component: ShimmerText,
  decorators: [
    (Story) => (
      <div className="bg-background p-8 text-2xl font-medium">
        <Story />
      </div>
    ),
  ],
  title: "Effects/ShimmerText",
} satisfies Meta<typeof ShimmerText>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Fast: Story = {
  args: {
    duration: 1.5,
  },
};
