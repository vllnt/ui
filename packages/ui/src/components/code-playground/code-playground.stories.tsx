import type { Meta, StoryObj } from "@storybook/react-vite";

import { CodePlayground } from "./code-playground";

const meta = {
  component: CodePlayground,
  title: "Content/CodePlayground",
} satisfies Meta<typeof CodePlayground>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
