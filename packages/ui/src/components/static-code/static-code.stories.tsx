import type { Meta, StoryObj } from "@storybook/react-vite";

import { StaticCode } from "./static-code";

const meta = {
  args: {
    code: `function greet(name: string): string {
  return \`Hello, \${name}!\`;
}

console.log(greet("World"));`,
    language: "typescript",
  },
  component: StaticCode,
  title: "Content/StaticCode",
} satisfies Meta<typeof StaticCode>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
