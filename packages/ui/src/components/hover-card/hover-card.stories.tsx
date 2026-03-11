import type { Meta, StoryObj } from "@storybook/react-vite";

import { HoverCard } from "./hover-card";

const meta = {
  args: {
    children: "HoverCard",
  },
  component: HoverCard,
  title: "Overlay/HoverCard",
} satisfies Meta<typeof HoverCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
