import type { Meta, StoryObj } from "@storybook/react-vite";

import { EdgeLabel } from "./edge-label";

const meta = {
  component: EdgeLabel,
  args: {
    children: "artifact stream",
    emphasis: "active",
  },
  title: "Canvas/EdgeLabel",
} satisfies Meta<typeof EdgeLabel>;

export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
