import type { Meta, StoryObj } from "@storybook/react-vite";

import { StatusIndicator } from "./status-indicator";

const meta = {
  args: {
    children: "Operational",
    tone: "success",
  },
  component: StatusIndicator,
  title: "Data/StatusIndicator",
} satisfies Meta<typeof StatusIndicator>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Variants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-3">
      <StatusIndicator tone="success">Operational</StatusIndicator>
      <StatusIndicator tone="warning">Needs review</StatusIndicator>
      <StatusIndicator tone="danger">Degraded</StatusIndicator>
      <StatusIndicator tone="info">Queued</StatusIndicator>
      <StatusIndicator tone="neutral" variant="outline">
        Draft
      </StatusIndicator>
    </div>
  ),
};