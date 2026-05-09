import type { Meta, StoryObj } from "@storybook/react-vite";

import {
  type PromptTemplate,
  PromptTemplates,
} from "./prompt-templates";

const TEMPLATES: PromptTemplate[] = [
  {
    category: "Code",
    description: "Review code for bugs, performance issues, and improvements",
    id: "code-review",
    template:
      "Review this {{language}} code for bugs, performance issues, and improvements:\n\n{{code}}",
    title: "Code Review",
  },
  {
    category: "Code",
    description: "Generate unit tests for a function",
    id: "code-tests",
    template: "Write unit tests for this {{language}} function:\n\n{{code}}",
    title: "Generate tests",
  },
  {
    category: "Writing",
    description: "Polish a draft for clarity and concision",
    id: "writing-polish",
    template:
      "Polish the following text for clarity and concision while keeping the original tone:\n\n{{text}}",
    title: "Polish writing",
  },
  {
    category: "Analysis",
    description: "Summarize a document into bullet points",
    id: "summary",
    template: "Summarize the following document in {{count}} bullet points:\n\n{{document}}",
    title: "Summarize",
  },
  {
    category: "Analysis",
    description: "Explain code line by line",
    id: "code-explain",
    template: "Explain what this code does line by line.",
    title: "Explain code",
  },
];

const meta = {
  args: {
    categories: [
      { name: "Code" },
      { name: "Writing" },
      { name: "Analysis" },
    ],
    onSelect: (resolved) => {
      console.log("selected", resolved);
    },
    templates: TEMPLATES,
  },
  component: PromptTemplates,
  title: "AI/PromptTemplates",
} satisfies Meta<typeof PromptTemplates>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const NoCategories: Story = {
  args: {
    categories: undefined,
  },
};

export const Empty: Story = {
  args: {
    categories: undefined,
    templates: [],
  },
};

export const CustomLabels: Story = {
  args: {
    labels: {
      empty: "No prompts saved yet.",
      insert: "Apply",
      searchPlaceholder: "Find a prompt…",
      use: "Apply prompt",
      variablesHeading: "Plug in your values",
    },
  },
};
