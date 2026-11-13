import type { Meta, StoryObj } from "@storybook/react-vite";

import { Kbd } from "./kbd";

const meta = {
  args: {
    children: "K",
    platform: "auto",
    size: "md",
    variant: "default",
  },
  argTypes: {
    platform: {
      control: "select",
      options: ["auto", "mac", "win"],
    },
    size: {
      control: "select",
      options: ["sm", "md", "lg"],
    },
    variant: {
      control: "select",
      options: ["default", "bracket"],
    },
  },
  component: Kbd,
  title: "Core/Kbd",
} satisfies Meta<typeof Kbd>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const SizeSm: Story = { args: { size: "sm" } };
export const SizeLg: Story = { args: { size: "lg" } };
export const Shortcut: Story = {
  args: { children: undefined, shortcut: "ctrl+k" },
};
export const ModShortcut: Story = {
  args: { children: undefined, shortcut: "mod+shift+p" },
};

export const PlatformMac: Story = {
  args: { children: undefined, platform: "mac", shortcut: "mod+k" },
};
export const PlatformWin: Story = {
  args: { children: undefined, platform: "win", shortcut: "mod+k" },
};

export const VariantBracket: Story = { args: { variant: "bracket" } };
export const BracketShortcutMac: Story = {
  args: {
    children: undefined,
    platform: "mac",
    shortcut: "mod+shift+p",
    variant: "bracket",
  },
};
export const BracketShortcutWin: Story = {
  args: {
    children: undefined,
    platform: "win",
    shortcut: "mod+shift+p",
    variant: "bracket",
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
