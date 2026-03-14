import type { Meta, StoryObj } from "@storybook/react-vite";

import { Carousel } from "./carousel";

const meta = {
  component: Carousel,
  title: "Content/Carousel",
} satisfies Meta<typeof Carousel>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
