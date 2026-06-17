import type { Meta, StoryObj } from "@storybook/react-vite";

import { ProgressiveBlur } from "./progressive-blur";

const meta = {
  component: ProgressiveBlur,
  decorators: [
    (Story) => (
      <div className="relative h-64 w-96 overflow-hidden rounded-xl border bg-card p-4 text-sm">
        <p>
          Content sits beneath the progressive blur layers so the chosen edge
          softens into the background while the opposite edge stays sharp.
        </p>
        <Story />
      </div>
    ),
  ],
  title: "Effects/ProgressiveBlur",
} satisfies Meta<typeof ProgressiveBlur>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const TopStrong: Story = {
  args: {
    blur: 16,
    direction: "top",
    layers: 6,
  },
};
