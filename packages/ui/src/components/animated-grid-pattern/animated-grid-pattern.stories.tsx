import type { Meta, StoryObj } from "@storybook/react-vite";

import { AnimatedGridPattern } from "./animated-grid-pattern";

const meta = {
  component: AnimatedGridPattern,
  decorators: [
    (Story) => (
      <div className="relative h-64 w-96 overflow-hidden rounded-xl border bg-card">
        <Story />
      </div>
    ),
  ],
  title: "Effects/AnimatedGridPattern",
} satisfies Meta<typeof AnimatedGridPattern>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Dense: Story = {
  args: {
    height: 24,
    squares: 48,
    width: 24,
  },
};
