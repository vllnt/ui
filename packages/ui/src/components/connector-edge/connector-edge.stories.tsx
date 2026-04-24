import type { Meta, StoryObj } from "@storybook/react-vite";

import { ConnectorEdge } from "./connector-edge";

const meta = {
  args: {
    end: { x: 320, y: 120 },
    label: "artifact stream",
    start: { x: 0, y: 0 },
    state: "active",
  },
  component: ConnectorEdge,
  render: (args) => (
    <div className="rounded-2xl border border-dashed border-border/70 bg-muted/10 p-6">
      <ConnectorEdge {...args} />
    </div>
  ),
  title: "Canvas/ConnectorEdge",
} satisfies Meta<typeof ConnectorEdge>;

export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
