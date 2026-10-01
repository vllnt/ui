import type { Meta, StoryObj } from "@storybook/react-vite";

import { ObjectHandle } from "./object-handle";

const meta = {
  component: ObjectHandle,
  args: {
    hint: "⌘ drag",
    label: "Reposition",
  },
  title: "Canvas/ObjectHandle",
} satisfies Meta<typeof ObjectHandle>;

export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
