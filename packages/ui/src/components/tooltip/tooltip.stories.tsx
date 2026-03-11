import type { Meta, StoryObj } from "@storybook/react-vite";

import { Tooltip } from "./tooltip";

const meta = {
  args: {
    children: "Tooltip",
  },
  component: Tooltip,
  title: "Overlay/Tooltip",
} satisfies Meta<typeof Tooltip>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
