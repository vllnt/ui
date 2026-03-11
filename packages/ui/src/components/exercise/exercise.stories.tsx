import type { Meta, StoryObj } from "@storybook/react-vite";

import { Exercise } from "./exercise";

const meta = {
  args: {
    children: "Exercise",
  },
  component: Exercise,
  title: "Learning/Exercise",
} satisfies Meta<typeof Exercise>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
