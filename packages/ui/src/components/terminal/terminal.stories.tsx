import type { Meta, StoryObj } from "@storybook/react-vite";

import { Terminal } from "./terminal";

const meta = {
  component: Terminal,
  title: "Content/Terminal",
} satisfies Meta<typeof Terminal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
