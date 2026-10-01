import type { Meta, StoryObj } from "@storybook/react-vite";

import { withWrapper } from "../../../../.storybook/decorators";

import { Meteors } from "./meteors";

const meta = {
  component: Meteors,
  decorators: [withWrapper("relative h-64 w-96 overflow-hidden rounded-xl border bg-card")],
  title: "Effects/Meteors",
} satisfies Meta<typeof Meteors>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    count: 16,
  },
};

export const Sparse: Story = { args: { count: 6 } };
