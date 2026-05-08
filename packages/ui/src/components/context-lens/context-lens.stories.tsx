import type { Meta, StoryObj } from "@storybook/react-vite";

import { ContextLens } from "./context-lens";

const meta = {
  args: {
    focus: { cx: 240, cy: 160, inner: 60, outer: 160 },
    opacity: 0.55,
  },
  component: ContextLens,
  decorators: [
    (Story) => (
      <div
        className="relative overflow-hidden rounded-lg border bg-gradient-to-br from-blue-500/40 to-emerald-500/40"
        style={{ height: 320, width: 480 }}
      >
        <div className="absolute inset-0 grid grid-cols-6 grid-rows-4 gap-2 p-3">
          {Array.from({ length: 24 }).map((_, idx) => (
            <div
              className="rounded-md bg-white/40"
              key={`tile-${idx}`}
            />
          ))}
        </div>
        <Story />
      </div>
    ),
  ],
  title: "Canvas/ContextLens",
} satisfies Meta<typeof ContextLens>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Tight: Story = {
  args: {
    focus: { cx: 240, cy: 160, inner: 30, outer: 80 },
    opacity: 0.7,
  },
};

export const Soft: Story = {
  args: {
    focus: { cx: 240, cy: 160, inner: 100, outer: 220 },
    opacity: 0.35,
  },
};

export const Hidden: Story = {
  args: { focus: null },
};
