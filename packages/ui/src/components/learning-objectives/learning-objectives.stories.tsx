import type { Meta, StoryObj } from "@storybook/react-vite";

import { LearningObjectives } from "./learning-objectives";

const headingTagOptions = ["h1", "h2", "h3", "h4", "h5", "h6"] as const;

const meta = {
  args: {
    children: "LearningObjectives",
    objectives: ["example"],
  },
  argTypes: {
    as: {
      control: "select",
      description: "Override the rendered heading tag.",
      options: headingTagOptions,
    },
  },
  component: LearningObjectives,
  title: "Learning/LearningObjectives",
} satisfies Meta<typeof LearningObjectives>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const HeadingOverride: Story = {
  args: {
    as: "h2",
  },
};
