import type { Meta, StoryObj } from "@storybook/react-vite";

import { AIToolCallDisplay } from "./ai-tool-call-display";

const meta = {
  args: {
    description: "Gathered logs from the latest deployment run.",
    duration: "1.2s",
    input: '{"service":"registry","window":"15m"}',
    output: '{"errors":0,"warnings":2}',
    toolName: "logs.fetch",
  },
  component: AIToolCallDisplay,
  title: "AI/ToolCallDisplay",
} satisfies Meta<typeof AIToolCallDisplay>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const ErrorState: Story = {
  args: {
    output: "Command failed: authentication token expired.",
    status: "error",
  },
};
