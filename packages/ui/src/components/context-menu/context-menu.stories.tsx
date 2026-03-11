import type { Meta, StoryObj } from "@storybook/react-vite";

import { ContextMenu } from "./context-menu";

const meta = {
  args: {
    children: "ContextMenu",
  },
  component: ContextMenu,
  title: "Components/ContextMenu",
} satisfies Meta<typeof ContextMenu>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
