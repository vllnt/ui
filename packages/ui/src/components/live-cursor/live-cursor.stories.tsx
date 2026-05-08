import type { Meta, StoryObj } from "@storybook/react-vite";

import { LiveCursor } from "./live-cursor";

const meta = {
  args: {
    color: "#5b8def",
    name: "Bea",
    x: 120,
    y: 80,
  },
  component: LiveCursor,
  decorators: [
    (Story) => (
      <div
        className="relative bg-muted/30"
        style={{ height: 240, width: 320 }}
      >
        <Story />
      </div>
    ),
  ],
  title: "Canvas/LiveCursor",
} satisfies Meta<typeof LiveCursor>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithStatus: Story = {
  args: {
    color: "#10b981",
    name: "Lior",
    status: "editing",
  },
};

export const ChipHidden: Story = {
  args: { name: null },
};

export const Warm: Story = {
  args: { color: "#f59e0b", name: "Sam" },
};
