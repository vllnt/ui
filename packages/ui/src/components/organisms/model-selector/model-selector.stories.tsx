import type { Meta, StoryObj } from "@storybook/react-vite";

import { ModelSelector } from "./model-selector";

const meta = {
  args: {
    models: [
      {
        description: "Most capable model",
        id: "anthropic/claude-opus-4-6",
        name: "Claude Opus 4.6",
      },
      {
        description: "Balanced performance",
        id: "anthropic/claude-sonnet-4-6",
        name: "Claude Sonnet 4.6",
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
