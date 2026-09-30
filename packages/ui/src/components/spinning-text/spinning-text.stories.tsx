import type { Meta, StoryObj } from "@storybook/react-vite";

import { withWrapper } from "../../../.storybook/decorators";

import { SpinningText } from "./spinning-text";

const meta = {
  args: {
    children: "vllnt design system • ",
  },
  component: SpinningText,
  decorators: [
    withWrapper("flex min-h-60 items-center justify-center p-10 text-sm text-foreground"),
  ],
  title: "Effects/SpinningText",
} satisfies Meta<typeof SpinningText>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const ReverseFast: Story = { args: { duration: 8, radius: 100, reverse: true } };
