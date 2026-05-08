import type { Meta, StoryObj } from "@storybook/react-vite";

import { InfinitePlane } from "./infinite-plane";

const meta = {
  args: {
    initialView: { x: 60, y: 40, zoom: 1 },
  },
  component: InfinitePlane,
  title: "Canvas/InfinitePlane",
} satisfies Meta<typeof InfinitePlane>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <div style={{ height: 400, width: "100%" }}>
      <InfinitePlane {...args}>
        <div
          className="absolute rounded-2xl border bg-background p-3 shadow-sm"
          style={{ left: 40, top: 20, width: 200 }}
        >
          <p className="text-sm font-medium">Object A</p>
        </div>
        <div
          className="absolute rounded-2xl border bg-background p-3 shadow-sm"
          style={{ left: 280, top: 120, width: 200 }}
        >
          <p className="text-sm font-medium">Object B</p>
        </div>
      </InfinitePlane>
    </div>
  ),
};

export const Zoomed: Story = {
  args: { initialView: { x: 60, y: 40, zoom: 1.6 } },
  render: (args) => (
    <div style={{ height: 400, width: "100%" }}>
      <InfinitePlane {...args}>
        <div
          className="absolute rounded-2xl border bg-background p-3 shadow-sm"
          style={{ left: 40, top: 20, width: 200 }}
        >
          <p className="text-sm font-medium">Zoomed object</p>
        </div>
      </InfinitePlane>
    </div>
  ),
};

export const WithoutGrid: Story = {
  args: { withoutGrid: true },
  render: (args) => (
    <div style={{ height: 400, width: "100%" }}>
      <InfinitePlane {...args}>
        <div
          className="absolute rounded-2xl border bg-muted p-3"
          style={{ left: 40, top: 20, width: 240 }}
        >
          <p className="text-sm font-medium">No grid</p>
        </div>
      </InfinitePlane>
    </div>
  ),
};
