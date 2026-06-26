import type { Meta, StoryObj } from "@storybook/react-vite";

import { TiltCard } from "./tilt-card";

const meta = {
  component: TiltCard,
  decorators: [
    (Story) => (
      <div className="flex min-h-64 items-center justify-center p-10">
        <Story />
      </div>
    ),
  ],
  title: "Effects/TiltCard",
} satisfies Meta<typeof TiltCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: "Hover to tilt",
    className:
      "flex h-40 w-64 items-center justify-center rounded-xl border bg-card text-card-foreground shadow-sm",
  },
};
