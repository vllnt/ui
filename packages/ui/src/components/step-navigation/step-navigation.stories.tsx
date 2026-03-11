import type { Meta, StoryObj } from "@storybook/react-vite";

import { StepNavigation } from "./step-navigation";

const meta = {
  component: StepNavigation,
  title: "Components/StepNavigation",
} satisfies Meta<typeof StepNavigation>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
