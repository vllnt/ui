import type { Meta, StoryObj } from "@storybook/react-vite";

import { KeyboardShortcutsHelp } from "./keyboard-shortcuts-help";

const headingTagOptions = ["h1", "h2", "h3", "h4", "h5", "h6"] as const;

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
  argTypes: {
    as: {
      control: "select",
      description: "Override the rendered heading tag.",
      options: headingTagOptions,
    },
  },
  component: KeyboardShortcutsHelp,
  title: "Learning/KeyboardShortcutsHelp",
} satisfies Meta<typeof KeyboardShortcutsHelp>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const HeadingOverride: Story = {
  args: {
    as: "h2",
  },
};
