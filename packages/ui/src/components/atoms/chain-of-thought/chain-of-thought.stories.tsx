import type { Meta, StoryObj } from "@storybook/react-vite";

import { ChainOfThought } from "./chain-of-thought";

const meta = {
  title: "AI/ChainOfThought",
  component: ChainOfThought,
  args: {
    steps: [
      { description: "Loaded src/index.ts", status: "complete", title: "Read the file" },
      { status: "active", title: "Apply the edit" },
      { title: "Run the test suite" },
    ],
  },
} satisfies Meta<typeof ChainOfThought>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithError: Story = {
  args: {
    steps: [
      { status: "complete", title: "Fetch the dataset" },
      { description: "Connection timed out", status: "error", title: "Validate rows" },
      { title: "Write the report" },
    ],
  },
};

export const AllComplete: Story = {
  args: {
    steps: [
      { status: "complete", title: "Plan" },
      { status: "complete", title: "Build" },
      { status: "complete", title: "Ship" },
    ],
  },
};
