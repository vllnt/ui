import type { Meta, StoryObj } from "@storybook/react-vite";

import { HandoffBeacon } from "./handoff-beacon";

const meta = {
  args: {
    level: "info",
    message: "Heads up",
    source: "Sam",
    x: 120,
    y: 80,
  },
  component: HandoffBeacon,
  decorators: [
    (Story) => (
      <div className="relative h-[260px] w-[480px] rounded-2xl border bg-muted/30">
        <Story />
      </div>
    ),
  ],
  title: "Canvas/HandoffBeacon",
} satisfies Meta<typeof HandoffBeacon>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Cluster: Story = {
  render: () => (
    <>
      <HandoffBeacon
        level="info"
        message="Heads up"
        source="Sam"
        x={120}
        y={80}
      />
      <HandoffBeacon
        level="request"
        message="Need a review"
        source="Wei"
        x={260}
        y={150}
      />
      <HandoffBeacon
        level="urgent"
        message="Schema mismatch"
        source="Riley"
        x={380}
        y={70}
      />
    </>
  ),
};

export const Pulsing: Story = {
  args: { level: "urgent", message: "Schema mismatch", source: "Riley" },
};

export const Anonymous: Story = {
  args: { message: "Look here", source: undefined },
};
