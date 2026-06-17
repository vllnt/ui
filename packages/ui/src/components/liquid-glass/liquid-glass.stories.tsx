import type { Meta, StoryObj } from "@storybook/react-vite";

import { LiquidGlass } from "./liquid-glass";

const meta = {
  args: {
    children: "Liquid glass surface",
  },
  component: LiquidGlass,
  decorators: [
    (Story) => (
      <div className="bg-gradient-to-br from-primary/30 to-accent/30 p-12">
        <div className="p-6">
          <Story />
        </div>
      </div>
    ),
  ],
  title: "Effects/LiquidGlass",
} satisfies Meta<typeof LiquidGlass>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
