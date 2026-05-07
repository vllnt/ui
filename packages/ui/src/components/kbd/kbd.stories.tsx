import type { Meta, StoryObj } from "@storybook/react-vite";

import { Kbd } from "./kbd";

const meta = {
  args: {
    children: "K",
    size: "md",
  },
  argTypes: {
    size: {
      control: "select",
      options: ["sm", "md", "lg"],
    },
  },
  component: Kbd,
  title: "Core/Kbd",
} satisfies Meta<typeof Kbd>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const SizeSm: Story = {
  args: {
    size: "sm",
  },
};

export const SizeLg: Story = {
  args: {
    size: "lg",
  },
};

export const Shortcut: Story = {
  args: {
    shortcut: "ctrl+k",
  },
};

export const ModShortcut: Story = {
  args: {
    shortcut: "mod+shift+p",
  },
};

export const Composed: Story = {
  render: (args) => (
    <span className="inline-flex items-center gap-1 text-sm">
      Press <Kbd {...args}>Ctrl</Kbd> + <Kbd {...args}>K</Kbd> to open the
      command palette.
    </span>
  ),
};
