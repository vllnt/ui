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
      options: ["default", "icon", "icon-lg", "lg", "sm"],
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
        "unstyled",
      ],
    },
  },
  component: Button,
  title: "Core/Button",
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const SizeIcon: Story = { args: { size: "icon" } };
export const SizeIconLg: Story = { args: { size: "icon-lg" } };
export const SizeLg: Story = { args: { size: "lg" } };
export const SizeSm: Story = { args: { size: "sm" } };
export const VariantDestructive: Story = { args: { variant: "destructive" } };
export const VariantGhost: Story = { args: { variant: "ghost" } };
export const VariantLink: Story = { args: { variant: "link" } };
export const VariantOutline: Story = { args: { variant: "outline" } };
export const VariantSecondary: Story = { args: { variant: "secondary" } };
/** No classes of its own: the button draws only what `className` gives it. */
export const VariantUnstyled: Story = {
  args: {
    className:
      "rounded-sm border border-dashed border-border px-3 py-1 text-sm text-foreground",
    variant: "unstyled",
  },
};
