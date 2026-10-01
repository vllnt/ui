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
