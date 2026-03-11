import type { Meta, StoryObj } from "@storybook/react-vite";

import { SearchDialog } from "./search-dialog";

const meta = {
  component: SearchDialog,
  title: "Learning/SearchDialog",
} satisfies Meta<typeof SearchDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
