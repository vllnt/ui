import type { Meta, StoryObj } from "@storybook/react-vite";

import { PromptInput } from "./prompt-input";

const meta = {
  args: {
    placeholder: "Ask anything…",
  },
  component: PromptInput,
  title: "AI/PromptInput",
} satisfies Meta<typeof PromptInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Loading: Story = {
  args: {
    isLoading: true,
    value: "Generating a response",
  },
};

export const WithToolbar: Story = {
  args: {
    toolbar: (
      <button
        className="rounded-md border border-border px-2 py-1 text-xs text-muted-foreground"
        type="button"
      >
        Attach
      </button>
    ),
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
    value: "Read-only prompt",
  },
};
