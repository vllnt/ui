import type { Meta, StoryObj } from "@storybook/react-vite";

import { Card } from "./card";

const meta = {
  args: {
    children: "Card",
  },
  component: Card,
  title: "Components/Card",
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
