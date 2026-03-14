import type { Meta, StoryObj } from "@storybook/react-vite";

import { InlineInput } from "./inline-input";

const meta = {
  args: {
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
