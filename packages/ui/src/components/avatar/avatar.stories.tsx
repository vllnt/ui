import type { Meta, StoryObj } from "@storybook/react-vite";

import { Avatar } from "./avatar";

const meta = {
  component: Avatar,
  title: "Components/Avatar",
} satisfies Meta<typeof Avatar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
