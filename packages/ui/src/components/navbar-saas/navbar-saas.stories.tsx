import type { Meta, StoryObj } from "@storybook/react-vite";

import { SidebarProvider } from "../sidebar-provider";
import { NavbarSaas } from "./navbar-saas";

const meta = {
  args: {
    brand: "Acme Inc",
    navItems: [
      { href: "/", title: "Home" },
      { href: "/docs", title: "Docs" },
      { href: "/blog", title: "Blog" },
    ],
  },
  component: NavbarSaas,
  decorators: [
    (Story) => (
      <SidebarProvider>
        <Story />
      </SidebarProvider>
    ),
  ],
  title: "Navigation/NavbarSaas",
} satisfies Meta<typeof NavbarSaas>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
