import type { Meta, StoryObj } from "@storybook/react-vite";

import { withWrapper } from "../../../.storybook/decorators";

import { SelectionPresence } from "./selection-presence";

const meta = {
  args: {
    color: "#5b8def",
    height: 80,
    name: "Bea",
    width: 140,
    x: 60,
    y: 60,
  },
  component: SelectionPresence,
  decorators: [withWrapper("relative bg-muted/30", { height: 220, width: 280 })],
  title: "Canvas/SelectionPresence",
} satisfies Meta<typeof SelectionPresence>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Warm: Story = { args: { color: "#f59e0b", name: "Sam" } };
export const ChipHidden: Story = { args: { name: null } };
export const Tall: Story = { args: { height: 160, width: 80 } };
