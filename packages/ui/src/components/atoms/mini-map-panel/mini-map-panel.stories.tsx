import type { Meta, StoryObj } from "@storybook/react-vite";

import { MiniMapPanel } from "./mini-map-panel";

const meta = {
  args: {
    markers: [
      { id: "run", label: "Run stream", x: 320, y: 240 },
      { id: "knowledge", label: "Knowledge cluster", x: 820, y: 420 },
      { id: "agent", label: "Agent loop", x: 1120, y: 760 },
    ],
    viewport: { height: 360, width: 520, x: 300, y: 180, zoom: 1 },
    world: { height: 1200, width: 1600 },
  },
  component: MiniMapPanel,
  title: "Panels/MiniMapPanel",
} satisfies Meta<typeof MiniMapPanel>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
