import type { Meta, StoryObj } from "@storybook/react-vite";

import { CanvasView } from "./canvas-view";
import { ZoomHUD } from "../zoom-hud";

const meta = {
  component: CanvasView,
  render: () => (
    <CanvasView
      className="h-[560px]"
      defaultViewport={{ x: 64, y: 48, zoom: 1 }}
      overlay={<div className="pointer-events-auto absolute bottom-4 right-4"><ZoomHUD zoom={1} /></div>}
    >
      <div className="relative h-[1000px] w-[1400px]">
        <div className="absolute left-20 top-16 w-72 rounded-3xl border border-border/60 bg-background/85 p-4 shadow-sm">
          Canvas objects can live on a calm spatial surface.
        </div>
        <div className="absolute left-[32rem] top-[22rem] w-64 rounded-3xl border border-border/60 bg-background/85 p-4 shadow-sm">
          Pan with space-drag and zoom with modified wheel input.
        </div>
      </div>
    </CanvasView>
  ),
  title: "Layout/CanvasView",
} satisfies Meta<typeof CanvasView>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
