import type { Meta, StoryObj } from "@storybook/react-vite";

import { ThreadBubble } from "./thread-bubble";

const noop = (): void => undefined;

const meta = {
  args: {
    messages: [
      {
        author: "Bea",
        authorColor: "#5b8def",
        body: "Why are we routing to fallback right now?",
        id: "1",
        ts: "12s",
      },
      {
        author: "Lior",
        authorColor: "#10b981",
        body: "p95 spike on primary — see graph.",
        id: "2",
        ts: "9s",
      },
      {
        author: "Sam",
        authorColor: "#f59e0b",
        body: "Will keep an eye on it for the next hour.",
        id: "3",
        ts: "now",
      },
    ],
    onResolve: noop,
    title: "research-2025",
  },
  component: ThreadBubble,
  decorators: [
    (Story) => (
      <div className="bg-muted/30 p-4">
        <Story />
      </div>
    ),
  ],
  title: "Canvas/ThreadBubble",
} satisfies Meta<typeof ThreadBubble>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Empty: Story = {
  args: { messages: [] },
};

export const WithFooter: Story = {
  args: {
    footer: (
      <input
        className="w-full rounded-md border border-border bg-background px-2 py-1 text-xs"
        placeholder="Reply…"
      />
    ),
  },
};

export const ReadOnly: Story = {
  args: { onResolve: undefined },
};
