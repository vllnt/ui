import type { Meta, StoryObj } from "@storybook/react-vite";

import { ModelSelector } from "./model-selector";

const meta = {
  args: {
    models: [
      {
        contextWindow: "200K",
        description: "Most capable model",
        id: "claude-opus-4-6",
        name: "Claude Opus 4.6",
        provider: "Anthropic",
      },
      {
        contextWindow: "200K",
        description: "Balanced performance",
        id: "claude-sonnet-4-6",
        name: "Claude Sonnet 4.6",
        provider: "Anthropic",
      },
    ],
    onOpenChange: () => {},
    onSelectModel: () => {},
    open: true,
    selectedModelId: "claude-opus-4-6",
  },
  component: ModelSelector,
  title: "Form/ModelSelector",
} satisfies Meta<typeof ModelSelector>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
