import type { Meta, StoryObj } from "@storybook/react-vite";

import { Typewriter } from "./typewriter";

const meta = {
  args: {
    text: "Building the future, one character at a time.",
  },
  component: Typewriter,
  title: "Effects/Typewriter",
} satisfies Meta<typeof Typewriter>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Fast: Story = {
  args: {
    speed: 25,
  },
};

export const NoCursor: Story = {
  args: {
    cursor: false,
  },
};
