import type { Meta, StoryObj } from "@storybook/react-vite";

import { ThemeToggle } from "./theme-toggle";

const meta = {
  args: {
    dict: {
      theme: {
        dark: "Dark",
        light: "Light",
        system: "System",
        toggle_theme: "Toggle theme",
      },
    },
  },
  component: ThemeToggle,
  title: "Utility/ThemeToggle",
} satisfies Meta<typeof ThemeToggle>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
