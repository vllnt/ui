import type { Meta, StoryObj } from "@storybook/react-vite";

import { SidebarProvider } from "./sidebar-provider";

const meta = {
  component: SidebarProvider,
  title: "Components/SidebarProvider",
} satisfies Meta<typeof SidebarProvider>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
