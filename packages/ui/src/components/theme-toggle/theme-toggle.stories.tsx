import type { Meta, StoryObj } from "@storybook/react-vite";

import { ThemeToggle } from "./theme-toggle";

const meta = {
  component: ThemeToggle,
  title: "Components/ThemeToggle",
} satisfies Meta<typeof ThemeToggle>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
