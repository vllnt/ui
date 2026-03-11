import type { Meta, StoryObj } from "@storybook/react-vite";

import { BlogCard } from "./blog-card";

const meta = {
  component: BlogCard,
  title: "Content/BlogCard",
} satisfies Meta<typeof BlogCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
