import type { Meta, StoryObj } from "@storybook/react-vite";

import { AISourceCitation } from "./ai-source-citation";

const meta = {
  args: {
    href: "https://example.com/research/agent-patterns",
    snippet:
      "Agent interfaces work best when message state, tool traces, and citations share the same visual language.",
    source: "Agent UI research",
    title: "Designing readable AI conversations",
  },
  component: AISourceCitation,
  title: "AI/SourceCitation",
} satisfies Meta<typeof AISourceCitation>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
