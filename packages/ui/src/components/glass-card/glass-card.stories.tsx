import type { Meta, StoryObj } from "@storybook/react-vite";

import { GlassCard } from "./glass-card";

const meta = {
  args: {
    children: "Frosted glass surface",
  },
  component: GlassCard,
  decorators: [
    (Story) => (
      <div className="bg-gradient-to-br from-primary/30 to-accent/30 p-12">
        <Story />
      </div>
    ),
  ],
  title: "Effects/GlassCard",
} satisfies Meta<typeof GlassCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
