import type { Meta, StoryObj } from "@storybook/react-vite";

import { StepByStep } from "./step-by-step";

const meta = {
  args: {
    children: "StepByStep",
  },
  component: StepByStep,
  title: "Components/StepByStep",
} satisfies Meta<typeof StepByStep>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
