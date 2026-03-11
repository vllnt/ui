import type { Meta, StoryObj } from "@storybook/react-vite";

import { SidebarToggle } from "./sidebar-toggle";

const meta = {
  component: SidebarToggle,
  title: "Navigation/SidebarToggle",
} satisfies Meta<typeof SidebarToggle>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
