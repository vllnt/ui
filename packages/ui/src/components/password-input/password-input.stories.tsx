import type { Meta, StoryObj } from "@storybook/react-vite";

import { PasswordInput } from "./password-input";

const meta = {
  args: {
    placeholder: "Enter password",
  },
  component: PasswordInput,
  title: "Form/PasswordInput",
} satisfies Meta<typeof PasswordInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
