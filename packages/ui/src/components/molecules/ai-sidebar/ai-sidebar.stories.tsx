import type { Meta, StoryObj } from "@storybook/react-vite";

import {
  AISidebar,
  AISidebarClose,
  AISidebarContent,
  AISidebarFooter,
  AISidebarHeader,
  AISidebarProvider,
  AISidebarTitle,
  AISidebarTrigger,
} from "./ai-sidebar";

const meta = {
  args: {
    defaultOpen: true,
    defaultPosition: "right",
  },
  argTypes: {
    defaultPosition: {
      control: "select",
      options: ["left", "right"],
    },
  },
  component: AISidebarProvider,
  title: "AI/AISidebar",
} satisfies Meta<typeof AISidebarProvider>;

export default meta;
type Story = StoryObj<typeof meta>;

const Frame = ({ children }: { children: React.ReactNode }): React.ReactNode => (
  <div className="relative h-[480px] w-full overflow-hidden rounded-xl border bg-muted/30">
    {children}
  </div>
);

export const Default: Story = {
  render: (args) => (
    <AISidebarProvider {...args}>
      <Frame>
        <AISidebarTrigger />
        <AISidebar className="!absolute">
          <AISidebarHeader>
            <AISidebarTitle>AI Assistant</AISidebarTitle>
            <AISidebarClose />
          </AISidebarHeader>
          <AISidebarContent>
            <p className="text-sm text-muted-foreground">
              Ask anything about this document.
            </p>
            <p className="text-sm text-foreground">
              I can help you summarize, draft, or refactor.
            </p>
          </AISidebarContent>
          <AISidebarFooter>
            <p className="text-xs text-muted-foreground">Composer goes here…</p>
          </AISidebarFooter>
        </AISidebar>
      </Frame>
    </AISidebarProvider>
  ),
};

export const LeftSide: Story = {
  args: {
    defaultPosition: "left",
  },
  render: (args) => (
    <AISidebarProvider {...args}>
      <Frame>
        <AISidebar className="!absolute">
          <AISidebarHeader>
            <AISidebarTitle>AI Assistant</AISidebarTitle>
            <AISidebarClose />
          </AISidebarHeader>
          <AISidebarContent>
            <p className="text-sm text-muted-foreground">Anchored to the left edge.</p>
          </AISidebarContent>
        </AISidebar>
      </Frame>
    </AISidebarProvider>
  ),
};

export const Closed: Story = {
  args: {
    defaultOpen: false,
  },
  render: (args) => (
    <AISidebarProvider {...args}>
      <Frame>
        <AISidebarTrigger />
        <AISidebar className="!absolute">
          <AISidebarHeader>
            <AISidebarTitle>AI Assistant</AISidebarTitle>
            <AISidebarClose />
          </AISidebarHeader>
          <AISidebarContent>
            <p className="text-sm text-muted-foreground">
              Click the trigger to open.
            </p>
          </AISidebarContent>
        </AISidebar>
      </Frame>
    </AISidebarProvider>
  ),
};
