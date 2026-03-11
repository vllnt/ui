import type { Meta, StoryObj } from "@storybook/react-vite";

import { Button } from "./button";

const meta = {
  args: {
    children: "Button",
    size: "default",
    variant: "default",
  },
  argTypes: {
    size: {
      control: "select",
      options: ["default", "icon", "lg", "sm"],
    },
    variant: {
      control: "select",
      options: [
        "default",
        "destructive",
        "ghost",
        "link",
        "outline",
        "secondary",
      ],
    },
  },
  component: Button,
  title: "Components/Button",
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const SizeIcon: Story = {
  args: {
    size: "icon",
  },
};

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

export const VariantDestructive: Story = {
  args: {
    variant: "destructive",
  },
};

export const VariantGhost: Story = {
  args: {
    variant: "ghost",
  },
};

export const VariantLink: Story = {
  args: {
    variant: "link",
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
