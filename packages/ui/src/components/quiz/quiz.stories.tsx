import type { Meta, StoryObj } from "@storybook/react-vite";

import { Quiz } from "./quiz";

const meta = {
  args: {
    options: [{
        label: "Label",
      }],
  },
  component: Quiz,
  title: "Learning/Quiz",
} satisfies Meta<typeof Quiz>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
