import type { Meta, StoryObj } from "@storybook/react-vite";

import { TextShimmer } from "./text-shimmer";

const meta = {
  args: {
    children: "Shimmering headline",
  },
  component: TextShimmer,
  decorators: [
    (Story) => (
      <div className="bg-background p-8 text-3xl font-semibold">
        <Story />
      </div>
    ),
  ],
  title: "Effects/TextShimmer",
} satisfies Meta<typeof TextShimmer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Slow: Story = {
  args: {
    duration: 4,
  },
};
