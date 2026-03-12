import type { Meta, StoryObj } from "@storybook/react-vite";

import { Quiz } from "./quiz";

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
  component: Quiz,
  title: "Learning/Quiz",
} satisfies Meta<typeof Quiz>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
