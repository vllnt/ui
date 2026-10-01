import type { Meta, StoryObj } from "@storybook/react-vite";

import { withWrapper } from "../../../../.storybook/decorators";

import { GlassCard } from "./glass-card";

const meta = {
  args: {
    children: "Frosted glass surface",
  },
  component: GlassCard,
  decorators: [withWrapper("bg-gradient-to-br from-primary/30 to-accent/30 p-12")],
  title: "Effects/GlassCard",
} satisfies Meta<typeof GlassCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
