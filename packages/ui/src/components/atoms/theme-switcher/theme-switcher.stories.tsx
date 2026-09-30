import type { Meta, StoryObj } from "@storybook/react-vite";

import { ThemeSwitcher } from "./theme-switcher";

const meta = {
  component: ThemeSwitcher,
  parameters: {
    layout: "centered",
  },
  title: "Utility/ThemeSwitcher",
} satisfies Meta<typeof ThemeSwitcher>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
