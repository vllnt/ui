import type { Meta, StoryObj } from "@storybook/react-vite";

import { KeyboardShortcutsHelp } from "./keyboard-shortcuts-help";

const meta = {
  args: {
    isOpen: true,
    onClose: () => {},
    shortcuts: [
      { description: "Go to next section", keys: ["ArrowRight"] },
      { description: "Go to previous section", keys: ["ArrowLeft"] },
      { description: "Toggle completion", keys: ["Space"] },
    ],
  },
  component: KeyboardShortcutsHelp,
  title: "Learning/KeyboardShortcutsHelp",
} satisfies Meta<typeof KeyboardShortcutsHelp>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
