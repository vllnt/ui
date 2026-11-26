import type { Meta, StoryObj } from "@storybook/react-vite";

import { Slider } from "./slider";

const meta = {
  args: {
    "aria-label": "Volume",
    defaultValue: [40],
    max: 100,
    step: 1,
  },
  component: Slider,
  title: "Core/Slider",
} satisfies Meta<typeof Slider>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** Each part takes its own classes, and every thumb its own props. */
export const PartClasses: Story = {
  args: {
    className: "h-6",
    rangeClassName: "bg-success",
    thumbClassName: "size-6 border-4 border-success",
    thumbProps: { "aria-label": "Music volume" },
    trackClassName: "h-2.5 rounded-sm bg-muted",
  },
};

