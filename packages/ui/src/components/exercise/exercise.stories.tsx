import type { Meta, StoryObj } from "@storybook/react-vite";

import { Exercise } from "./exercise";

const meta = {
  args: {
    children:
      "Write a function that reverses a string without using the built-in reverse method.",
    difficulty: "medium",
    hint: "Try using a for loop that iterates from the end of the string.",
    title: "Reverse a String",
  },
  component: Exercise,
  title: "Learning/Exercise",
} satisfies Meta<typeof Exercise>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
