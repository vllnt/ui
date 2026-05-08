import type { Meta, StoryObj } from "@storybook/react-vite";

import { LiveCursor } from "./live-cursor";

const meta = {
  args: {
    color: "blue",
    label: "Sam",
    x: 120,
    y: 80,
  },
  component: LiveCursor,
  decorators: [
    (Story) => (
      <div className="relative h-[240px] w-[480px] rounded-2xl border bg-muted/30">
        <Story />
      </div>
    ),
  ],
  title: "Canvas/LiveCursor",
} satisfies Meta<typeof LiveCursor>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Cluster: Story = {
  render: () => (
    <>
      <LiveCursor color="emerald" label="Sam" x={120} y={80} />
      <LiveCursor color="blue" label="Riley" x={260} y={140} />
      <LiveCursor color="rose" label="Wei" x={380} y={50} />
      <LiveCursor color="amber" label="Jordan" x={80} y={170} />
    </>
  ),
};

export const NoLabel: Story = {
  args: { label: undefined },
};
