import type { Meta, StoryObj } from "@storybook/react-vite";

import { Badge } from "./badge";

const meta = {
  args: {
    children: "Badge",
    variant: "default",
  },
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "destructive", "outline", "secondary"],
    },
  },
  component: Badge,
  title: "Components/Badge",
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const VariantDestructive: Story = {
  args: {
    variant: "destructive",
  },
};

export const VariantOutline: Story = {
  args: {
    variant: "outline",
  },
};

export const VariantSecondary: Story = {
  args: {
    variant: "secondary",
  },
};
