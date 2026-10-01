import type { Meta, StoryObj } from "@storybook/react-vite";

import { AIStreamingText } from "./ai-streaming-text";

const meta = {
  args: {
    text: "I checked the deployment logs and found the slow step in the image optimization pipeline.",
  },
  component: AIStreamingText,
  title: "AI/StreamingText",
} satisfies Meta<typeof AIStreamingText>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Streaming: Story = {
  args: {
    isStreaming: true,
    text: "I checked the deployment logs and found the slow step",
  },
};
