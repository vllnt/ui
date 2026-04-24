import type { Meta, StoryObj } from "@storybook/react-vite";

import { AnchorPort } from "./anchor-port";

const meta = {
  component: AnchorPort,
  render: () => (
    <div className="flex gap-3 rounded-2xl border border-dashed border-border/70 bg-muted/20 p-6">
      <AnchorPort aria-label="Input port" tone="input" />
      <AnchorPort aria-label="Bidirectional port" state="active" tone="bidirectional" />
      <AnchorPort aria-label="Output port" state="blocked" tone="output" />
    </div>
  ),
  title: "Canvas/AnchorPort",
} satisfies Meta<typeof AnchorPort>;

export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
