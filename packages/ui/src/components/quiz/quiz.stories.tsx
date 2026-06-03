import type { Meta, StoryObj } from "@storybook/react-vite";

import { Quiz } from "./quiz";

const headingTagOptions = ["h1", "h2", "h3", "h4", "h5", "h6"] as const;

const meta = {
  args: {
    options: [
      { correct: true, label: "Paris" },
      { label: "London" },
      { label: "Berlin" },
      { label: "Madrid" },
    ],
    question: "What is the capital of France?",
  },
  argTypes: {
    as: {
      control: "select",
      description: "Override the rendered heading tag.",
      options: headingTagOptions,
    },
  },
  component: Quiz,
  title: "Learning/Quiz",
} satisfies Meta<typeof Quiz>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const HeadingOverride: Story = {
  args: {
    as: "h2",
  },
};
