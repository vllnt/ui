import type { Meta, StoryObj } from "@storybook/react-vite";

import { withWrapper } from "../../../../.storybook/decorators";

import { LiveCursor } from "./live-cursor";

const meta = {
  args: {
    color: "#5b8def",
    name: "Bea",
    x: 120,
    y: 80,
  },
  component: LiveCursor,
  decorators: [withWrapper("relative bg-muted/30", { height: 240, width: 320 })],
  title: "Canvas/LiveCursor",
} satisfies Meta<typeof LiveCursor>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithStatus: Story = { args: { color: "#10b981", name: "Lior", status: "editing" } };
export const ChipHidden: Story = { args: { name: null } };
export const Warm: Story = { args: { color: "#f59e0b", name: "Sam" } };
