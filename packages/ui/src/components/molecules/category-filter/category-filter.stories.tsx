import type { Meta, StoryObj } from "@storybook/react-vite";

import { CategoryFilter } from "./category-filter";

const meta = {
  args: {
    categories: ["example"],
  },
  component: CategoryFilter,
  title: "Form/CategoryFilter",
} satisfies Meta<typeof CategoryFilter>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
