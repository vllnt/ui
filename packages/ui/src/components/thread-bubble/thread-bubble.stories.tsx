import type { Meta, StoryObj } from "@storybook/react-vite";

import { type ThreadReply, ThreadBubble } from "./thread-bubble";

const REPLIES: ThreadReply[] = [
  {
    body: "We should reword this. The current copy reads passive.",
    id: "1",
    timestamp: "2026-05-08T09:00:00Z",
    user: "Sam",
  },
  {
    body: "Agreed — drafting a fix.",
    id: "2",
    timestamp: "2026-05-08T09:05:00Z",
    user: "Wei",
  },
  {
    body: "Pushed to staging.",
    id: "3",
    timestamp: "2026-05-08T09:32:00Z",
    user: "Riley",
  },
];

const meta = {
  args: {
    replies: REPLIES,
    title: "Trade-off summary",
  },
  component: ThreadBubble,
  title: "Canvas/ThreadBubble",
} satisfies Meta<typeof ThreadBubble>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Resolved: Story = { args: { resolved: true } };

export const Untitled: Story = { args: { title: undefined } };

export const CustomCompose: Story = {
  args: {
    composeSlot: (
      <textarea
        className="min-h-12 w-full resize-y rounded-md border border-border bg-background px-2 py-1 text-xs"
        placeholder="Reply with markdown…"
      />
    ),
  },
};
