import type { Meta, StoryObj } from "@storybook/react-vite";

import { CompletionDialog } from "./completion-dialog";

const headingTagOptions = ["h1", "h2", "h3", "h4", "h5", "h6"] as const;

const meta = {
  args: {
    isOpen: true,
    onCancel: () => {},
    onClose: () => {},
    onConfirm: () => {},
    title: "Congratulations!",
  },
  argTypes: {
    as: {
      control: "select",
      description: "Override the rendered heading tag.",
      options: headingTagOptions,
    },
  },
  component: CompletionDialog,
  title: "Learning/CompletionDialog",
} satisfies Meta<typeof CompletionDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const HeadingOverride: Story = {
  args: {
    as: "h2",
  },
};
