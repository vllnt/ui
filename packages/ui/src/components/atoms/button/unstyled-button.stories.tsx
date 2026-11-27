import type { Meta, StoryObj } from "@storybook/react-vite";

import { UnstyledButton } from "./unstyled-button";

const meta = {
  args: {
    children: "A",
    className:
      "rounded-sm border border-dashed border-border px-3 py-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50",
  },
  argTypes: {
    disabled: { control: "boolean" },
  },
  component: UnstyledButton,
  title: "Core/UnstyledButton",
} satisfies Meta<typeof UnstyledButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Disabled: Story = { args: { disabled: true } };
