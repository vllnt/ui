import type { Meta, StoryObj } from "@storybook/react-vite";

import { Flashcard } from "./flashcard";

const meta = {
  args: {
    answer: "A noun names a person, place, thing, or idea.",
    category: "Grammar",
    hint: "Think about the job a word does in a sentence.",
    question: "What is a noun?",
    title: "Parts of speech",
  },
  component: Flashcard,
  title: "Learning/Flashcard",
} satisfies Meta<typeof Flashcard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
