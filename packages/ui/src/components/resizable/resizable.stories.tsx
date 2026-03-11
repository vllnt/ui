import type { Meta, StoryObj } from "@storybook/react-vite";

import { ResizableHandle } from "./resizable";

const meta = {
  component: ResizableHandle,
  title: "Utility/Resizable",
} satisfies Meta<typeof ResizableHandle>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
