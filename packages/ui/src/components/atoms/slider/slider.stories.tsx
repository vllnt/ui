import type { Meta, StoryObj } from "@storybook/react-vite";

import { Slider } from "./slider";

const meta = {
  component: Slider,
  title: "Core/Slider",
} satisfies Meta<typeof Slider>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
