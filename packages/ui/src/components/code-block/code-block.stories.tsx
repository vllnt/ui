import type { Meta, StoryObj } from "@storybook/react-vite";

import { CodeBlock } from "./code-block";

const meta = {
  component: CodeBlock,
  title: "Components/CodeBlock",
} satisfies Meta<typeof CodeBlock>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
