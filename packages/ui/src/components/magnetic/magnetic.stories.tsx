import type { Meta, StoryObj } from "@storybook/react-vite";

import { Magnetic } from "./magnetic";

const meta = {
  args: {
    children: "Pull me",
  },
  component: Magnetic,
  decorators: [
    (Story) => (
      <div className="flex min-h-40 items-center justify-center p-10">
        <Story />
      </div>
    ),
  ],
  title: "Effects/Magnetic",
} satisfies Meta<typeof Magnetic>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    className:
      "rounded-xl border border-border bg-card px-8 py-6 text-card-foreground",
  },
};

export const Strong: Story = {
  args: {
    className:
      "rounded-xl border border-border bg-card px-8 py-6 text-card-foreground",
    strength: 0.8,
  },
};
