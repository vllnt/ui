import type { Meta, StoryObj } from "@storybook/react-vite";

import { CategoryFilter } from "./category-filter";

const meta = {
  component: CategoryFilter,
  title: "Components/CategoryFilter",
} satisfies Meta<typeof CategoryFilter>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
