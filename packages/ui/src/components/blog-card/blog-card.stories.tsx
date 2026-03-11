import type { Meta, StoryObj } from "@storybook/react-vite";

import { BlogCard } from "./blog-card";

const meta = {
  args: {
    href: "#",
    post: {
      description: "A short description of the blog post content.",
      slug: "example-post",
      tags: ["example"],
      title: "Example Blog Post",
    },
  },
  component: BlogCard,
  title: "Content/BlogCard",
} satisfies Meta<typeof BlogCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
