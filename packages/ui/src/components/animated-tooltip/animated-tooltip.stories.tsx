import type { Meta, StoryObj } from "@storybook/react-vite";

import { AnimatedTooltip } from "./animated-tooltip";

const meta = {
  args: {
    children: (
      <button
        className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
        type="button"
      >
        Hover me
      </button>
    ),
    content: "Tooltip content",
  },
  component: AnimatedTooltip,
  decorators: [
    (Story) => (
      <div className="flex min-h-40 items-center justify-center p-10">
        <Story />
      </div>
    ),
  ],
  title: "Effects/AnimatedTooltip",
} satisfies Meta<typeof AnimatedTooltip>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Bottom: Story = {
  args: {
    side: "bottom",
  },
};
