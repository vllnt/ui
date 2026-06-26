import type { Meta, StoryObj } from "@storybook/react-vite";

import { ShinyButton } from "./shiny-button";

const meta = {
  args: {
    children: "Learn more",
  },
  component: ShinyButton,
  title: "Effects/ShinyButton",
} satisfies Meta<typeof ShinyButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
