// manual
import type { Meta, StoryObj } from "@storybook/react-vite";

import { CodePlayground } from "./code-playground";

const headingTagOptions = ["h1", "h2", "h3", "h4", "h5", "h6"] as const;

const meta = {
  args: {
    children: "const greeting = 'Hello';\nconsole.log(greeting);",
    filename: "greeting.ts",
    language: "typescript",
    title: "Log a greeting",
  },
  argTypes: {
    as: {
      control: "select",
      description: "Override the rendered heading tag.",
      options: headingTagOptions,
    },
  },
  component: CodePlayground,
  title: "Content/CodePlayground",
} satisfies Meta<typeof CodePlayground>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const HeadingOverride: Story = { args: { as: "h2" } };
