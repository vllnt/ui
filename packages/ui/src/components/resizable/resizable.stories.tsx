import type { Meta, StoryObj } from "@storybook/react-vite";

import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "./resizable";

const meta = {
  component: ResizablePanelGroup,
  title: "Utility/Resizable",
} satisfies Meta<typeof ResizablePanelGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <ResizablePanelGroup
      className="min-h-[200px] max-w-md rounded-lg border"
      direction="horizontal"
    >
      <ResizablePanel defaultSize={50}>
        <div className="flex h-full items-center justify-center p-6">
          <span className="font-semibold">Panel One</span>
        </div>
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel defaultSize={50}>
        <div className="flex h-full items-center justify-center p-6">
          <span className="font-semibold">Panel Two</span>
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  ),
};
