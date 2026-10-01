import type { Meta, StoryObj } from "@storybook/react-vite";

import { AlertDialog } from "./alert-dialog";

const meta = {
  args: {
    children: "AlertDialog",
  },
  component: AlertDialog,
  title: "Overlay/AlertDialog",
} satisfies Meta<typeof AlertDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
