import type { Meta, StoryObj } from "@storybook/react-vite";

import { Callout } from "./callout";

const meta = {
  args: {
    children: "Callout",
  },
  component: Callout,
  title: "Content/Callout",
} satisfies Meta<typeof Callout>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
