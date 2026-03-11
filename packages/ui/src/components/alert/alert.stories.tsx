import type { Meta, StoryObj } from "@storybook/react-vite";

import { Alert } from "./alert";

const meta = {
  args: {
    children: "Alert",
    variant: "default",
  },
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "destructive"],
    },
  },
  component: Alert,
  title: "Components/Alert",
} satisfies Meta<typeof Alert>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const VariantDestructive: Story = {
  args: {
    variant: "destructive",
  },
};
