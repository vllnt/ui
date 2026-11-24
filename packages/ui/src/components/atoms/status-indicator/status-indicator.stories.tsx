import type { Meta, StoryObj } from "@storybook/react-vite";
import { CircleAlert, CircleCheck, CircleX, Info } from "lucide-react";

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

export const WithIcon: Story = {
  render: () => (
    <div className="flex flex-wrap gap-3">
      <StatusIndicator icon={<CircleCheck />} tone="success">
        Operational
      </StatusIndicator>
      <StatusIndicator icon={<CircleAlert />} tone="warning">
        Degraded
      </StatusIndicator>
      <StatusIndicator icon={<CircleX />} tone="danger">
        Outage
      </StatusIndicator>
      <StatusIndicator icon={<Info />} tone="info">
        Maintenance
      </StatusIndicator>
    </div>
  ),
};

export const IconOnGlass: Story = {
  render: () => (
    <div className="vllnt-glass vllnt-glass-dense inline-flex gap-3 rounded-xl border p-3">
      <StatusIndicator icon={<CircleCheck />} tone="success" variant="outline">
        Operational
      </StatusIndicator>
      <StatusIndicator icon={<CircleX />} tone="danger" variant="outline">
        Outage
      </StatusIndicator>
    </div>
  ),
};
