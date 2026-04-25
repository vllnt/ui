import type { Meta, StoryObj } from "@storybook/react-vite";

import { AnchorPort } from "../anchor-port";
import { ObjectCard } from "../object-card";
import { GroupHull } from "./group-hull";

const meta = {
  component: GroupHull,
  render: () => (
    <GroupHull
      description="Keep related agents, runs, and artifacts in a durable neighborhood instead of a transient dashboard row."
      eyebrow="Workspace cluster"
      title="Publishing lane"
    >
      <ObjectCard
        kind="Agent"
        metrics={[{ label: "Runs", value: "8 active" }]}
        ports={<AnchorPort aria-label="Agent port" tone="output" />}
        state="running"
        summary="Generates social copy from approved article drafts."
        title="Writer"
      />
      <ObjectCard
        kind="Artifact"
        metrics={[{ label: "Revisions", value: "12" }]}
        ports={<AnchorPort aria-label="Artifact port" tone="input" />}
        state="complete"
        summary="Pinned draft bundle ready for channel formatting."
        title="Launch thread"
      />
    </GroupHull>
  ),
  title: "Canvas/GroupHull",
} satisfies Meta<typeof GroupHull>;

export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
