import type { Meta, StoryObj } from "@storybook/react-vite";

import { Quiz } from "./quiz";

const meta = {
  args: {
    children: "Quiz",
  },
  component: Quiz,
  title: "Components/Quiz",
} satisfies Meta<typeof Quiz>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
