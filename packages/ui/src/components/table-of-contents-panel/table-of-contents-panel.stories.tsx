import type { Meta, StoryObj } from "@storybook/react-vite";

import { TableOfContentsPanel } from "./table-of-contents-panel";

const meta = {
  component: TableOfContentsPanel,
  title: "Utility/TableOfContentsPanel",
} satisfies Meta<typeof TableOfContentsPanel>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
