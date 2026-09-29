import type { Meta, StoryObj } from "@storybook/react-vite";

import { withWrapper } from "../../../.storybook/decorators";

import { InfinitePlane } from "./infinite-plane";

const meta = {
  args: {
    pattern: "dot",
    spacing: 32,
    translate: { x: 0, y: 0 },
    zoom: 1,
  },
  component: InfinitePlane,
  decorators: [withWrapper(undefined, { height: 240, width: 360 })],
  title: "Canvas/InfinitePlane",
} satisfies Meta<typeof InfinitePlane>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Dot: Story = {};

export const Grid: Story = { args: { pattern: "grid", spacing: 24 } };
export const Blank: Story = { args: { pattern: "blank" } };

export const ZoomedAndPanned: Story = {
  args: {
    spacing: 24,
    translate: { x: 16, y: 8 },
    zoom: 2,
  },
};
