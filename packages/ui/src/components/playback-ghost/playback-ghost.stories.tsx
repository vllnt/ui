import type { Meta, StoryObj } from "@storybook/react-vite";

import { PlaybackGhost } from "./playback-ghost";

const meta = {
  args: {
    kind: "run",
    label: "research-2025",
    opacity: 0.4,
    size: 40,
    x: 160,
    y: 100,
  },
  component: PlaybackGhost,
  decorators: [
    (Story) => (
      <div
        className="relative bg-muted/30"
        style={{ height: 220, width: 320 }}
      >
        <div
          className="absolute rounded-md border border-border bg-background"
          style={{ height: 60, left: 180, top: 80, width: 120 }}
        />
        <Story />
      </div>
    ),
  ],
  title: "Canvas/PlaybackGhost",
} satisfies Meta<typeof PlaybackGhost>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Faint: Story = {
  args: { opacity: 0.2 },
};

export const Bold: Story = {
  args: { opacity: 0.7 },
};

export const Glyphless: Story = {
  args: { kind: undefined, label: "anon" },
};
