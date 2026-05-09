import type { Meta, StoryObj } from "@storybook/react-vite";

import { StickyMetric } from "./sticky-metric";

const meta = {
  args: {
    anchor: "top-right",
    detail: "↑ 12%",
    label: "qps",
    tone: "success",
    value: "240",
    x: 200,
    y: 100,
  },
  component: StickyMetric,
  decorators: [
    (Story) => (
      <div
        className="relative bg-muted/30"
        style={{ height: 240, width: 320 }}
      >
        <div
          className="absolute rounded-md border border-border bg-background"
          style={{ height: 80, left: 80, top: 80, width: 160 }}
        />
        <Story />
      </div>
    ),
  ],
  title: "Canvas/StickyMetric",
} satisfies Meta<typeof StickyMetric>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Danger: Story = {
  args: {
    detail: undefined,
    label: "errs",
    tone: "danger",
    value: "14",
  },
};

export const BottomLeft: Story = {
  args: {
    anchor: "bottom-left",
    x: 80,
    y: 160,
  },
};

export const Plain: Story = {
  args: {
    detail: undefined,
    tone: "neutral",
  },
};
