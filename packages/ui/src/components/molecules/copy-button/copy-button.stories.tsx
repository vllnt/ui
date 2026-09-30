import type { Meta, StoryObj } from "@storybook/react-vite";

import { CopyButton } from "./copy-button";

const meta = {
  args: {
    value: "EXAMPLE_API_KEY",
    variant: "icon",
  },
  argTypes: {
    variant: {
      control: "select",
      options: ["icon", "inline", "button"],
    },
  },
  component: CopyButton,
  title: "Core/CopyButton",
} satisfies Meta<typeof CopyButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Inline: Story = {
  args: {
    value: "usr_42",
    variant: "inline",
  },
  render: (args) => (
    <span className="inline-flex items-center gap-1 text-sm">
      User ID: usr_42 <CopyButton {...args} />
    </span>
  ),
};

export const ButtonVariant: Story = {
  args: {
    label: "Copy link",
    value: "https://ui.vllnt.com",
    variant: "button",
  },
};

export const CustomLabels: Story = {
  args: {
    copiedLabel: "Got it!",
    label: "Copy API key",
    value: "EXAMPLE_API_KEY",
    variant: "button",
  },
};
