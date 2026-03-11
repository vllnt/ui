import type { Meta, StoryObj } from "@storybook/react-vite";

import { Table } from "./table";

const meta = {
  args: {
    children: "Table",
  },
  component: Table,
  title: "Data/Table",
} satisfies Meta<typeof Table>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
