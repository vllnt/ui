import type { Meta, StoryObj } from "@storybook/react-vite";

import { Stepper } from "./stepper";

const meta = {
  args: {
    currentStep: 2,
    steps: [
      { id: "intro", title: "Introduction", description: "Set context and vocabulary." },
      { id: "practice", title: "Guided practice", description: "Work through a solved example.", meta: "8 min" },
      { id: "check", title: "Knowledge check", description: "Answer a quick prompt to confirm understanding." },
      { id: "reflect", title: "Reflection", description: "Capture the main takeaway." },
    ],
  },
  component: Stepper,
  title: "Learning/Stepper",
} satisfies Meta<typeof Stepper>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Vertical: Story = {
  args: {
    orientation: "vertical",
  },
};
