import type { Meta, StoryObj } from "@storybook/react-vite";

import { UsageBreakdown } from "./usage-breakdown";

const meta = {
  args: {
    description: "Ranked resource consumption across your most active surfaces.",
    items: [
      {
        description: "Prompt + completion tokens used this billing window.",
        id: "tokens",
        label: "Tokens",
        meta: "LLM",
        trend: { direction: "up", label: "+14%" },
        value: 420,
        valueLabel: "420k",
      },
      {
        description: "Embeddings and cached retrieval index footprint.",
        id: "storage",
        label: "Storage",
        meta: "Vector DB",
        trend: { direction: "down", label: "-6%" },
        value: 260,
        valueLabel: "260 GB",
      },
      {
        description: "Webhook and instrumentation traffic routed through analytics.",
        id: "events",
        label: "Events",
        meta: "Tracking",
        value: 180,
        valueLabel: "180k",
      },
    ],
    title: "Usage breakdown",
  },
  component: UsageBreakdown,
  title: "Analytics/UsageBreakdown",
} satisfies Meta<typeof UsageBreakdown>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const TopTwoOnly: Story = {
  args: {
    maxItems: 2,
  },
};

export const Empty: Story = {
  args: {
    items: [],
  },
};
