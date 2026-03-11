// manual
import type { Meta, StoryObj } from "@storybook/react-vite";

import { SidebarProvider } from "../sidebar-provider";

import { Sidebar } from "./sidebar";

const sampleSections = [
  {
    items: [
      { href: "/introduction", title: "Introduction" },
      { href: "/installation", title: "Installation" },
      { href: "/quickstart", title: "Quick Start" },
    ],
    title: "Getting Started",
  },
  {
    collapsible: true,
    defaultOpen: true,
    items: [
      { href: "/button", title: "Button" },
      { href: "/input", title: "Input" },
      { href: "/dialog", title: "Dialog" },
      { href: "/dropdown", title: "Dropdown Menu" },
    ],
    title: "Components",
  },
  {
    collapsible: true,
    defaultOpen: false,
    items: [
      { href: "/theming", title: "Theming" },
      { href: "/customization", title: "Customization" },
    ],
    title: "Advanced",
  },
];

const meta = {
  component: Sidebar,
  decorators: [
    (Story) => (
      <SidebarProvider>
        <div style={{ display: "flex", height: "500px" }}>
          <Story />
        </div>
      </SidebarProvider>
    ),
  ],
  parameters: {
    layout: "fullscreen",
  },
  title: "Navigation/Sidebar",
} satisfies Meta<typeof Sidebar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    sections: sampleSections,
  },
};
