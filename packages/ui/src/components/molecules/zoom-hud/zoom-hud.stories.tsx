import type { Meta, StoryObj } from "@storybook/react-vite";

import { ZoomHUD } from "./zoom-hud";

const meta = {
  args: {
    zoom: 1,
  },
  component: ZoomHUD,
  title: "Overlay/ZoomHUD",
} satisfies Meta<typeof ZoomHUD>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
