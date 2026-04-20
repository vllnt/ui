import type { Meta, StoryObj } from "@storybook/react-vite";

import { AnimatedText } from "./animated-text";

const meta = {
  args: {
    text: "Ship motion that still feels like the current system.",
  },
  component: AnimatedText,
  title: "Utility/AnimatedText",
} satisfies Meta<typeof AnimatedText>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Characters: Story = {
  args: {
    splitBy: "character",
    stagger: 30,
    text: "Animate every letter.",
  },
};
