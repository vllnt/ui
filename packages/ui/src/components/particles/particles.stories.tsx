import type { Meta, StoryObj } from "@storybook/react-vite";

import { Particles } from "./particles";

const meta = {
  component: Particles,
  decorators: [
    (Story) => (
      <div className="relative h-64 w-96 overflow-hidden rounded-xl border bg-card">
        <Story />
      </div>
    ),
  ],
  title: "Effects/Particles",
} satisfies Meta<typeof Particles>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    count: 40,
  },
};

export const Sparse: Story = {
  args: {
    count: 12,
  },
};
