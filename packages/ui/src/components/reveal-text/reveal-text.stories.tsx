import type { Meta, StoryObj } from "@storybook/react-vite";

import { withWrapper } from "../../../.storybook/decorators";

import { RevealText } from "./reveal-text";

const meta = {
  args: {
    children: "Reveal headline",
  },
  component: RevealText,
  decorators: [withWrapper("bg-background p-8 text-3xl font-semibold text-foreground")],
  title: "Effects/RevealText",
} satisfies Meta<typeof RevealText>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const FromLeft: Story = { args: { direction: "left" } };
export const Delayed: Story = { args: { delay: 300 } };
