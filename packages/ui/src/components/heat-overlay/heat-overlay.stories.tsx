import type { Meta, StoryObj } from "@storybook/react-vite";

import { HeatOverlay } from "./heat-overlay";

const meta = {
  args: {
    intensity: 56,
    points: [
      { id: "a", tone: "danger", weight: 1, x: 90, y: 80 },
      { id: "b", tone: "warn", weight: 0.6, x: 200, y: 110 },
      { id: "c", tone: "cool", weight: 0.4, x: 280, y: 180 },
      { id: "d", weight: 0.5, x: 140, y: 180 },
    ],
  },
  component: HeatOverlay,
  decorators: [
    (Story) => (
      <div
        className="relative bg-muted/20"
        style={{ height: 240, width: 360 }}
      >
        <Story />
      </div>
    ),
  ],
  title: "Canvas/HeatOverlay",
} satisfies Meta<typeof HeatOverlay>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Empty: Story = {
  args: { points: [] },
};

export const Cool: Story = {
  args: {
    defaultTone: "cool",
    points: [
      { id: "a", weight: 0.8, x: 100, y: 90 },
      { id: "b", weight: 0.5, x: 220, y: 140 },
    ],
  },
};

export const HighIntensity: Story = {
  args: { intensity: 96 },
};
