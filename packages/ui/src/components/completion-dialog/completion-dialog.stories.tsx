import type { Meta, StoryObj } from "@storybook/react-vite";

import { CompletionDialog } from "./completion-dialog";

const meta = {
  component: CompletionDialog,
  title: "Learning/CompletionDialog",
} satisfies Meta<typeof CompletionDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
