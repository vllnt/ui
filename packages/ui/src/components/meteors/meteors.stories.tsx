import type { Meta, StoryObj } from "@storybook/react-vite";

import { Meteors } from "./meteors";

const meta = {
  component: Meteors,
  decorators: [
    (Story) => (
      <div className="relative h-64 w-96 overflow-hidden rounded-xl border bg-card">
        <Story />
      </div>
    ),
  ],
  title: "Effects/Meteors",
} satisfies Meta<typeof Meteors>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    count: 16,
  },
};

export const Sparse: Story = {
  args: {
    count: 6,
  },
};
