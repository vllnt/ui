import type { Meta, StoryObj } from "@storybook/react-vite";

import { Slideshow } from "./slideshow";

const meta = {
  component: Slideshow,
  title: "Content/Slideshow",
} satisfies Meta<typeof Slideshow>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
