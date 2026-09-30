import type { Meta, StoryObj } from "@storybook/react-vite";

import { Collapsible } from "./collapsible";

const meta = {
  component: Collapsible,
  title: "Content/Collapsible",
} satisfies Meta<typeof Collapsible>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
