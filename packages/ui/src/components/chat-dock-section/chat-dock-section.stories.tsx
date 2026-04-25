import type { Meta, StoryObj } from "@storybook/react-vite";

import { ChatDockSection } from "./chat-dock-section";

const meta = {
  component: ChatDockSection,
  args: {
    contextLabel: "Today · overview",
    messages: [
      {
        body: "Three failed runs came in overnight. Start with the invoice retry and the security digest.",
        id: "assistant",
        speaker: "Assistant",
      },
      {
        body: "Queue the approvals first, then review the stale automations after lunch.",
        id: "operator",
        speaker: "Operator",
      },
    ],
  },
  render: (args) => (
    <div className="w-full max-w-md">
      <ChatDockSection {...args} />
    </div>
  ),
  title: "Layout/ChatDockSection",
} satisfies Meta<typeof ChatDockSection>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
