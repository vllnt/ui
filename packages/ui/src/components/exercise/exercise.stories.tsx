import type { Meta, StoryObj } from "@storybook/react-vite";

import { Exercise } from "./exercise";

const headingTagOptions = ["h1", "h2", "h3", "h4", "h5", "h6"] as const;

const meta = {
  args: {
    children:
      "Write a function that reverses a string without using the built-in reverse method.",
    difficulty: "medium",
    hint: "Try using a for loop that iterates from the end of the string.",
    title: "Reverse a String",
  },
  argTypes: {
    as: {
      control: "select",
      description: "Override the rendered heading tag.",
      options: headingTagOptions,
    },
  },
  component: Exercise,
  title: "Learning/Exercise",
} satisfies Meta<typeof Exercise>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const HeadingOverride: Story = {
  args: {
    as: "h2",
  },
};
