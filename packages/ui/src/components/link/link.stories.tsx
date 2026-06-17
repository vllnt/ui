import type { Meta, StoryObj } from "@storybook/react-vite";

import { Link } from "./link";

const meta = {
  args: {
    children: "Read the docs",
    href: "#",
    variant: "default",
  },
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "muted", "underline"],
    },
  },
  component: Link,
  title: "Core/Link",
} satisfies Meta<typeof Link>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Muted: Story = {
  args: {
    variant: "muted",
  },
};

export const Underline: Story = {
  args: {
    variant: "underline",
  },
};

export const External: Story = {
  args: {
    children: "Visit example.com",
    external: true,
    href: "https://example.com",
  },
};
