import type { Meta, StoryObj } from "@storybook/react-vite";

import { Tabs } from "./tabs";

const meta = {
  args: {
    children: "Tabs",
  },
  component: Tabs,
  title: "Components/Tabs",
} satisfies Meta<typeof Tabs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
