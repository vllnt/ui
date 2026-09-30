import type { Meta, StoryObj } from "@storybook/react-vite";

import { CodeBlock } from "./code-block";

const meta = {
  args: {
    children: `function greet(name: string): string {
  return \`Hello, \${name}!\`;
}

console.log(greet("World"));`,
    language: "typescript",
    showLanguage: true,
  },
  component: CodeBlock,
  title: "Content/CodeBlock",
} satisfies Meta<typeof CodeBlock>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
