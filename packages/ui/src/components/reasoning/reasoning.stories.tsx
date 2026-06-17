import type { Meta, StoryObj } from "@storybook/react-vite";

import { Reasoning } from "./reasoning";

const meta = {
  args: {
    duration: 4,
    steps: [
      "Parse the user request and identify the goal.",
      "Check the cache for a recent matching answer.",
      "Compose the final response from the retrieved context.",
    ],
  },
  component: Reasoning,
  title: "AI/Reasoning",
} satisfies Meta<typeof Reasoning>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Streaming: Story = {
  args: {
    isStreaming: true,
    steps: ["Parse the user request and identify the goal."],
  },
};

export const FreeForm: Story = {
  args: {
    children:
      "I weighed two approaches and chose the simpler one because it avoids an extra dependency.",
    steps: undefined,
  },
};
