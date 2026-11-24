import type { Meta, StoryObj } from "@storybook/react-vite";

import { Link } from "./link";

const meta = {
  args: {
    children: "Read the docs",
    href: "#",
    size: "default",
    variant: "default",
  },
  argTypes: {
    size: {
      control: "select",
      options: ["sm", "default", "lg"],
    },
    variant: {
      control: "select",
      options: ["default", "foreground", "muted", "skip", "underline"],
    },
  },
  component: Link,
  title: "Core/Link",
} satisfies Meta<typeof Link>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Foreground: Story = { args: { variant: "foreground" } };
export const Muted: Story = { args: { variant: "muted" } };
export const Underline: Story = { args: { variant: "underline" } };

export const SizeSm: Story = { args: { size: "sm" } };
export const SizeLg: Story = {
  args: { children: "Pricing", size: "lg", variant: "foreground" },
};

/** Press Tab to bring it into view at the top left. */
export const Skip: Story = {
  args: { children: "Skip to content", href: "#main", variant: "skip" },
};

export const External: Story = {
  args: {
    children: "Visit example.com",
    external: true,
    href: "https://example.com",
  },
};
