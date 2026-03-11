import type { Meta, StoryObj } from "@storybook/react-vite";

import { Command } from "./command";

const meta = {
  args: {
    children: "Command",
  },
  component: Command,
  title: "Components/Command",
} satisfies Meta<typeof Command>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
