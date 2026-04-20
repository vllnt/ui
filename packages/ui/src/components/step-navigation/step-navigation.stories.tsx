import type { Meta, StoryObj } from "@storybook/react-vite";

import { StepNavigation } from "./step-navigation";

const meta = {
  args: {
    canNext: true,
    canPrev: true,
    currentStep: 2,
    onNext: () => {},
    onPrev: () => {},
    totalSteps: 5,
  },
  component: StepNavigation,
  title: "Navigation/StepNavigation",
} satisfies Meta<typeof StepNavigation>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
