import type { Meta, StoryObj } from "@storybook/react-vite";

import { TextField } from "./text-field";

const meta = {
  args: {
    label: "Email",
    placeholder: "you@example.com",
  },
  component: TextField,
  title: "Form/TextField",
} satisfies Meta<typeof TextField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    description: "We will never share your email address.",
  },
};

export const WithError: Story = {
  args: {
    defaultValue: "not-an-email",
    error: "Enter a valid email address.",
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
    value: "locked@example.com",
  },
};
