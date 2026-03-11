import type { Meta, StoryObj } from "@storybook/react-vite";

import { TableOfContents } from "./table-of-contents";

const meta = {
  component: TableOfContents,
  title: "Components/TableOfContents",
} satisfies Meta<typeof TableOfContents>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
