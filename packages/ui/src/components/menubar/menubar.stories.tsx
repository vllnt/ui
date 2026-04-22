import type { Meta, StoryObj } from "@storybook/react-vite";

import { Menubar } from "./menubar";

const meta = {
  args: {
    children: "Menubar",
  },
  component: Menubar,
  title: "Navigation/Menubar",
} satisfies Meta<typeof Menubar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
