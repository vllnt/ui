import type { Meta, StoryObj } from "@storybook/react-vite";

import { ProTip } from "./pro-tip";

const meta = {
  args: {
    children: "ProTip",
  },
  component: ProTip,
  title: "Components/ProTip",
} satisfies Meta<typeof ProTip>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
