import type { Meta, StoryObj } from "@storybook/react-vite";

import { TimelineScrubber } from "./timeline-scrubber";

const meta = {
  args: {
    end: 3600,
    formatValue: (v: number) => `${Math.round(v / 60)}m`,
    onValueChange: () => undefined,
    start: 0,
    ticks: [
      { id: "deploy", tone: "primary", value: 600 },
      { id: "alert", tone: "danger", value: 2400 },
    ],
    tone: "primary",
    value: 1800,
  },
  component: TimelineScrubber,
  decorators: [
    (Story) => (
      <div className="w-72 bg-muted/30 p-4">
        <Story />
      </div>
    ),
  ],
  title: "Canvas/TimelineScrubber",
} satisfies Meta<typeof TimelineScrubber>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const NoTicks: Story = {
  args: { ticks: undefined },
};

export const Warning: Story = {
  args: { tone: "warn", value: 3000 },
};

export const RawValues: Story = {
  args: { formatValue: undefined, ticks: undefined },
};
