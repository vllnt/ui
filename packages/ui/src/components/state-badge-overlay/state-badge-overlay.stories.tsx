import type { Meta, StoryObj } from "@storybook/react-vite";

import { StateBadgeOverlay } from "./state-badge-overlay";

const meta = {
  args: {
    anchor: "top-right",
    state: "running",
    x: 200,
    y: 100,
  },
  component: StateBadgeOverlay,
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
  title: "Canvas/StateBadgeOverlay",
} satisfies Meta<typeof StateBadgeOverlay>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Failed: Story = {
  args: {
    anchor: "bottom-left",
    state: "failed",
    x: 80,
    y: 160,
  },
};

export const Complete: Story = {
  args: {
    state: "complete",
  },
};

export const CustomLabel: Story = {
  args: {
    label: "Spawning",
    state: "queued",
  },
};
