import type { Meta, StoryObj } from "@storybook/react-vite";

import { Sparkles } from "./sparkles";

const meta = {
  component: Sparkles,
  decorators: [
    (Story) => (
      <div className="relative flex h-64 w-96 items-center justify-center rounded-xl border bg-card text-card-foreground">
        <Story />
      </div>
    ),
  ],
  title: "Effects/Sparkles",
} satisfies Meta<typeof Sparkles>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: <span className="text-lg font-semibold">Sparkle field</span>,
    count: 24,
  },
};

export const Dense: Story = {
  args: {
    count: 60,
  },
};
