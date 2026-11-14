import type { Meta, StoryObj } from "@storybook/react-vite";

import { ProgressBar } from "./progress-bar";

const meta = {
  args: {
    max: 100,
    value: 40,
  },
  argTypes: {
    mode: {
      control: "inline-radio",
      options: ["determinate", "indeterminate"],
    },
    size: {
      control: "inline-radio",
      options: ["sm", "md", "lg"],
    },
    tone: {
      control: "select",
      options: ["neutral", "primary", "success", "info", "warning", "danger"],
    },
  },
  component: ProgressBar,
  title: "Data/ProgressBar",
} satisfies Meta<typeof ProgressBar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Complete: Story = {
  args: { isComplete: true, value: 100 },
};

export const Loading: Story = {
  args: { isLoading: true },
};

export const Neutral: Story = {
  args: { tone: "neutral" },
};

export const Info: Story = {
  args: { tone: "info" },
};

export const Success: Story = {
  args: { tone: "success" },
};

export const Warning: Story = {
  args: { tone: "warning", value: 80 },
};

export const Danger: Story = {
  args: { tone: "danger", value: 95 },
};

export const Small: Story = {
  args: { size: "sm" },
};

export const Large: Story = {
  args: { size: "lg" },
};

export const Indeterminate: Story = {
  args: { label: "Preparing upload", mode: "indeterminate" },
};

export const StepLabel: Story = {
  args: { label: "Step", max: 8, value: 3, valueLabel: "3 / 8" },
};

export const ShowValue: Story = {
  args: { label: "Upload", showValue: true },
};

export const WithoutLabels: Story = {
  args: { "aria-label": "Upload progress", showLabels: false },
};
