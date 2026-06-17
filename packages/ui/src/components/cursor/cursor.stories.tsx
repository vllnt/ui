import type { Meta, StoryObj } from "@storybook/react-vite";

import { Cursor } from "./cursor";

const meta = {
  component: Cursor,
  decorators: [
    (Story) => (
      <div className="relative flex h-64 w-96 items-center justify-center rounded-xl border bg-card text-sm text-muted-foreground">
        Move the pointer across the canvas.
        <Story />
      </div>
    ),
  ],
  title: "Effects/Cursor",
} satisfies Meta<typeof Cursor>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Large: Story = {
  args: {
    size: 40,
  },
};
