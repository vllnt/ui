import type { Meta, StoryObj } from "@storybook/react-vite";

import { AIMessageBubble } from "./ai-message-bubble";

const meta = {
  args: {
    author: "Assistant",
    children:
      "I reviewed the integration logs and found a single failing background job.",
    timestamp: "2m ago",
  },
  component: AIMessageBubble,
  title: "AI/MessageBubble",
} satisfies Meta<typeof AIMessageBubble>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const User: Story = {
  args: {
    author: "You",
    children: "Please check why the job stalled after the second step.",
    messageRole: "user",
  },
};

export const Tool: Story = {
  args: {
    author: "Build Agent",
    children:
      "Ran pnpm test:once in packages/ui and collected the failing suite.",
    messageRole: "tool",
    status: "complete",
  },
};
