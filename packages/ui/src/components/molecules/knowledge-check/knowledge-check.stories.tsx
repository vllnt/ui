import type { Meta, StoryObj } from "@storybook/react-vite";

import {
  KnowledgeCheck,
  type KnowledgeCheckQuestion,
} from "./knowledge-check";

const QUESTIONS: KnowledgeCheckQuestion[] = [
  {
    id: "react-purpose",
    options: [
      { correct: true, label: "A UI library", value: "ui" },
      { label: "A database", value: "db" },
      { label: "A backend framework", value: "backend" },
    ],
    question: "What is React?",
    type: "multiple-choice",
  },
  {
    answer: false,
    explanation:
      "React is a UI library that focuses on the view layer. Frameworks bundle routing, state, and conventions.",
    id: "react-framework",
    question: "React is a framework.",
    type: "true-false",
  },
  {
    answer: "useState",
    explanation:
      "useState returns the current state and a setter function for updating it.",
    id: "state-hook",
    question: "The React hook for component state is ___",
    type: "fill-blank",
  },
];

const meta = {
  args: {
    questions: QUESTIONS,
    title: "Check your understanding",
  },
  component: KnowledgeCheck,
  title: "Educational/KnowledgeCheck",
} satisfies Meta<typeof KnowledgeCheck>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const SingleQuestion: Story = {
  args: {
    questions: [
      {
        answer: "true",
        caseSensitive: false,
        id: "loop",
        question: "Type `true` to confirm.",
        type: "fill-blank",
      },
    ],
  },
};

export const MultipleChoiceOnly: Story = {
  args: {
    questions: [
      {
        id: "rendering",
        options: [
          { correct: true, label: "Re-render when state changes", value: "rerender" },
          { label: "Mutate the DOM directly", value: "mutate" },
          { label: "Wait for the user to call render()", value: "manual" },
        ],
        question: "How does React update the DOM?",
        type: "multiple-choice",
      },
    ],
  },
};
