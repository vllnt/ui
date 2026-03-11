import type { Meta, StoryObj } from "@storybook/react-vite";

import { Breadcrumb } from "./breadcrumb";

const meta = {
  component: Breadcrumb,
  title: "Navigation/Breadcrumb",
} satisfies Meta<typeof Breadcrumb>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
