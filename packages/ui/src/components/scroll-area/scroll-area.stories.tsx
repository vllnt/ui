import type { Meta, StoryObj } from "@storybook/react-vite";

import { ScrollArea } from "./scroll-area";

const meta = {
  args: {
    children: "ScrollArea",
  },
  component: ScrollArea,
  title: "Components/ScrollArea",
} satisfies Meta<typeof ScrollArea>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
