import type { Meta, StoryObj } from "@storybook/react-vite";

import { Tour } from "./tour";

const meta = {
  args: {
    steps: [
      {
        badge: "Start here",
        description: "The overview introduces goals, key vocabulary, and the pacing for the lesson.",
        id: "overview",
        title: "Overview",
      },
      {
        description: "Worked examples walk through a complete solution with annotations and checkpoints.",
        hint: "Pair this step with the stepper or checklist components for a fuller guided flow.",
        id: "examples",
        title: "Examples",
      },
      {
        badge: "Wrap up",
        description: "End with a quick self-check and a reflection prompt so learners can consolidate the takeaway.",
        id: "wrap-up",
        title: "Wrap up",
      },
    ],
  },
  component: Tour,
  title: "Learning/Tour",
} satisfies Meta<typeof Tour>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
