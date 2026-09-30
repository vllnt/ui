import type { Meta, StoryObj } from "@storybook/react-vite";

import { withWrapper } from "../../../.storybook/decorators";

import { MultiSelectLasso } from "./multi-select-lasso";

const meta = {
  args: {
    count: 4,
    hint: "Drag",
    rect: { height: 120, width: 180, x: 60, y: 50 },
  },
  component: MultiSelectLasso,
  decorators: [withWrapper("relative bg-muted/30", { height: 240, width: 360 })],
  title: "Canvas/MultiSelectLasso",
} satisfies Meta<typeof MultiSelectLasso>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const NoCount: Story = { args: { count: undefined, hint: undefined } };
export const SingleItem: Story = { args: { count: 1, hint: undefined } };
export const Hidden: Story = { args: { rect: null } };
