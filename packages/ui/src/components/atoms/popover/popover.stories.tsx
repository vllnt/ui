import type { Meta, StoryObj } from "@storybook/react-vite";

import { Popover } from "./popover";

const meta = {
  args: {
    children: "Popover",
  },
  component: Popover,
  title: "Overlay/Popover",
} satisfies Meta<typeof Popover>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
