import type { Meta, StoryObj } from "@storybook/react-vite";

import { SelectionPresence } from "./selection-presence";

const meta = {
  args: {
    children: (
      <div className="rounded-2xl border bg-background p-4">
        <p className="text-sm font-medium">Object A</p>
      </div>
    ),
    color: "blue",
    name: "Sam",
  },
  component: SelectionPresence,
  decorators: [
    (Story) => (
      <div className="p-6">
        <Story />
      </div>
    ),
  ],
  title: "Canvas/SelectionPresence",
} satisfies Meta<typeof SelectionPresence>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Emerald: Story = { args: { color: "emerald", name: "Wei" } };

export const NoName: Story = { args: { color: "rose", name: undefined } };
