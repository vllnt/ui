import type { Meta, StoryObj } from "@storybook/react-vite";

import { ThresholdRing } from "./threshold-ring";

const meta = {
  args: {
    centerLabel: "68%",
    threshold: 0.7,
    tone: "warn",
    value: 0.68,
  },
  component: ThresholdRing,
  decorators: [
    (Story) => (
      <div className="flex items-center justify-center bg-muted/30 p-8">
        <Story />
      </div>
    ),
  ],
  title: "Canvas/ThresholdRing",
} satisfies Meta<typeof ThresholdRing>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const HealthyBudget: Story = {
  args: {
    centerLabel: "32%",
    threshold: 0.7,
    tone: "success",
    value: 0.32,
  },
};

export const OverThreshold: Story = {
  args: {
    centerLabel: "92%",
    threshold: 0.7,
    tone: "danger",
    value: 0.92,
  },
};

export const NoThreshold: Story = {
  args: {
    centerLabel: "50%",
    threshold: undefined,
    tone: "neutral",
    value: 0.5,
  },
};
