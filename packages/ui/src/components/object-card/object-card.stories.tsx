import type { Meta, StoryObj } from "@storybook/react-vite";

import { AnchorPort } from "../anchor-port";
import { ObjectCard } from "./object-card";

const meta = {
  component: ObjectCard,
  render: () => (
    <ObjectCard
      actions={[{ label: "Open" }, { label: "Inspect" }]}
      footer="Latest output stabilized 2m ago"
      kind="Agent"
      metrics={[
        { label: "Runs", value: "24 today" },
        { label: "Queue", value: "3 pending" },
        { label: "Latency", value: "1.2s p95" },
        { label: "Policy", value: "Safe mode" },
      ]}
      ports={<AnchorPort aria-label="Output port" state="active" />}
      state="running"
      summary="Durable runtime object tracking prompts, tools, handoffs, and artifact outputs."
      title="Jarvis orchestration agent"
    />
  ),
  title: "Canvas/ObjectCard",
} satisfies Meta<typeof ObjectCard>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
