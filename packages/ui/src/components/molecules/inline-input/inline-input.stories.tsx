// manual
import type { Meta, StoryObj } from "@storybook/react-vite";

import { InlineInput } from "./inline-input";

const meta = {
  args: {
    "aria-label": "Document title",
    onChange: () => {},
    onCommit: () => {},
    value: "Edit me",
  },
  component: InlineInput,
  title: "Form/InlineInput",
} satisfies Meta<typeof InlineInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
