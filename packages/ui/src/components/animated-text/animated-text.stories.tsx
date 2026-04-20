import type { Meta, StoryObj } from "@storybook/react-vite";

import { AnimatedText } from "./animated-text";

const meta = {
  args: {
    text: "BOOTING VLLNT INTERFACE...",
  },
  component: AnimatedText,
  title: "Utility/AnimatedText",
} satisfies Meta<typeof AnimatedText>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Terminal: Story = {};

export const Matrix: Story = {
  args: {
    stagger: 35,
    text: "ACCESSING VECTOR MEMORY GRID",
    variant: "matrix",
  },
};

export const Typewriter: Story = {
  args: {
    stagger: 45,
    text: "LOAD PROGRAM // READY",
    variant: "typewriter",
  },
};

export const Reveal: Story = {
  args: {
    splitBy: "word",
    stagger: 70,
    text: "Ship motion that still feels like the current system.",
    variant: "reveal",
  },
};
