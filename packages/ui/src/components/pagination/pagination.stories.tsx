import type { Meta, StoryObj } from "@storybook/react-vite";

import { Pagination } from "./pagination";

const meta = {
  component: Pagination,
  title: "Components/Pagination",
} satisfies Meta<typeof Pagination>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
