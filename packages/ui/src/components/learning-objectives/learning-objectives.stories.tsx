import type { Meta, StoryObj } from "@storybook/react-vite";

import { LearningObjectives } from "./learning-objectives";

const meta = {
  args: {
    children: "LearningObjectives",
  },
  component: LearningObjectives,
  title: "Components/LearningObjectives",
} satisfies Meta<typeof LearningObjectives>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
