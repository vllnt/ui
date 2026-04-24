import type { Meta, StoryObj } from "@storybook/react-vite";

import { Rating } from "./rating";

const meta = {
  args: {
    defaultValue: 4,
    label: "Lesson quality",
    showValue: true,
  },
  component: Rating,
  title: "Learning/Rating",
} satisfies Meta<typeof Rating>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const ReadOnly: Story = {
  args: {
    readOnly: true,
    value: 5,
  },
};
