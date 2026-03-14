import type { Meta, StoryObj } from "@storybook/react-vite";

import { Drawer } from "./drawer";

const meta = {
  component: Drawer,
  title: "Overlay/Drawer",
} satisfies Meta<typeof Drawer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
