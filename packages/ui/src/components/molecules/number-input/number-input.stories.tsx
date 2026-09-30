import type { Meta, StoryObj } from "@storybook/react-vite";

import { NumberInput } from "./number-input";

const meta = {
  args: {
    defaultValue: 2,
    min: 0,
    step: 1,
  },
  component: NumberInput,
  title: "Form/NumberInput",
} satisfies Meta<typeof NumberInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
