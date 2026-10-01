// manual
import type { Meta, StoryObj } from "@storybook/react-vite";

import { Pagination } from "./pagination";

const meta = {
  args: {
    baseUrl: "/blog",
    currentPage: 3,
    totalPages: 10,
  },
  component: Pagination,
  title: "Navigation/Pagination",
} satisfies Meta<typeof Pagination>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
