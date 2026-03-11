import type { Meta, StoryObj } from "@storybook/react-vite";

import { ThinkingBlock } from "./thinking-block";

const meta = {
  component: ThinkingBlock,
  title: "Components/ThinkingBlock",
} satisfies Meta<typeof ThinkingBlock>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
