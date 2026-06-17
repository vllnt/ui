import type { Meta, StoryObj } from "@storybook/react-vite";

import { GlassProgress } from "./glass-progress";

const meta = {
  args: {
    value: 60,
  },
  component: GlassProgress,
  decorators: [
    (Story) => (
      <div className="w-80 bg-gradient-to-br from-primary/30 to-accent/30 p-12">
        <Story />
      </div>
    ),
  ],
  title: "Effects/GlassProgress",
} satisfies Meta<typeof GlassProgress>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Full: Story = {
  args: {
    value: 100,
  },
};
