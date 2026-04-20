import type { Meta, StoryObj } from "@storybook/react-vite";

import { NavigationMenu } from "./navigation-menu";

const meta = {
  args: {
    children: "NavigationMenu",
  },
  component: NavigationMenu,
  title: "Navigation/NavigationMenu",
} satisfies Meta<typeof NavigationMenu>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
