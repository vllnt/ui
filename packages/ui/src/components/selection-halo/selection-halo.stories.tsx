import type { Meta, StoryObj } from "@storybook/react-vite";

import { SelectionHalo } from "./selection-halo";

const meta = {
  args: {
    bounds: { height: 120, width: 220, x: 120, y: 90 },
    label: "3 objects",
  },
  component: SelectionHalo,
  decorators: [
    (Story) => (
      <div className="relative h-[280px] w-[480px] rounded-2xl border bg-muted/30">
        <Story />
      </div>
    ),
  ],
  title: "Canvas/SelectionHalo",
} satisfies Meta<typeof SelectionHalo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Pulsing: Story = { args: { pulsing: true } };

export const NoLabel: Story = { args: { label: undefined } };
