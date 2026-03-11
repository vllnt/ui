import type { Meta, StoryObj } from "@storybook/react-vite";

import { KeyboardShortcutsHelp } from "./keyboard-shortcuts-help";

const meta = {
  component: KeyboardShortcutsHelp,
  title: "Components/KeyboardShortcutsHelp",
} satisfies Meta<typeof KeyboardShortcutsHelp>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
