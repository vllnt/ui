import type { Meta, StoryObj } from "@storybook/react-vite";

import { withWrapper } from "../../../../.storybook/decorators";

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

export const Titled: Story = {
  args: {
    title: "greet.ts",
  },
};

export const LineNumbers: Story = {
  args: {
    showLineNumbers: true,
  },
};

export const Wrapped: Story = {
  args: {
    children: `const message = "A long line that does not fit in a narrow column, so it wraps onto the next row instead of scrolling sideways.";`,
    title: "message.ts",
    wrap: true,
  },
  decorators: [withWrapper("max-w-xs")],
};

export const Scrolling: Story = {
  args: {
    children: `const message = "A long line that does not fit in a narrow column, so it scrolls sideways because wrap is off.";`,
    title: "message.ts",
  },
  decorators: [withWrapper("max-w-xs")],
};

export const Full: Story = {
  args: {
    showLineNumbers: true,
    title: "greet.ts",
    wrap: true,
  },
};

export const Dark: Story = {
  args: {
    showLineNumbers: true,
    title: "greet.ts",
  },
  decorators: [withWrapper("dark bg-background p-4")],
};
