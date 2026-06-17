import type { Meta, StoryObj } from "@storybook/react-vite";

import { Meter } from "./meter";

const meta = {
  args: {
    label: "Disk usage",
    max: 100,
    min: 0,
    value: 72,
    valueText: "72% used",
    variant: "default",
  },
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "secondary", "destructive"],
    },
  },
  component: Meter,
  title: "Core/Meter",
} satisfies Meta<typeof Meter>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Destructive: Story = {
  args: {
    label: "Storage almost full",
    value: 94,
    valueText: "94% used",
    variant: "destructive",
  },
};

export const Segmented: Story = {
  args: {
    label: "Signal strength",
    max: 5,
    segments: 5,
    value: 3,
    valueText: "3 of 5 bars",
  },
};
