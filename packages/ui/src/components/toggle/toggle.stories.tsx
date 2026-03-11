import type { Meta, StoryObj } from "@storybook/react-vite";

import { Toggle } from "./toggle";

const meta = {
  args: {
    size: "default",
    variant: "default",
  },
  argTypes: {
    size: {
      control: "select",
      options: ["default", "lg", "sm"],
    },
    variant: {
      control: "select",
      options: ["default", "outline"],
    },
  },
  component: Toggle,
  title: "Components/Toggle",
} satisfies Meta<typeof Toggle>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const SizeLg: Story = {
  args: {
    size: "lg",
  },
};

export const SizeSm: Story = {
  args: {
    size: "sm",
  },
};

export const VariantOutline: Story = {
  args: {
    variant: "outline",
  },
};
