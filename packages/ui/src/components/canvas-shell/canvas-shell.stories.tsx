import type { Meta, StoryObj } from "@storybook/react-vite";

import { CanvasShell } from "./canvas-shell";
import { CanvasFoundationDemo } from "./canvas-foundation-demo";

const meta = {
  component: CanvasShell,
  render: () => <CanvasFoundationDemo />,
  title: "Layout/CanvasShell",
} satisfies Meta<typeof CanvasShell>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
