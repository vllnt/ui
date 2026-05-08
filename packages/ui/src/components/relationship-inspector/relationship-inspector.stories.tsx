import type { Meta, StoryObj } from "@storybook/react-vite";

import { RelationshipInspector } from "./relationship-inspector";

const noop = (): void => undefined;

const meta = {
  args: {
    edges: [
      {
        direction: "inbound",
        id: "1",
        onActivate: noop,
        relation: "spawned-by",
        target: "run-2025-04-15",
        targetSublabel: "claude-3.7",
      },
      {
        direction: "outbound",
        id: "2",
        onActivate: noop,
        relation: "emits",
        target: "summary.md",
        targetSublabel: "1.2 KB",
      },
      {
        direction: "outbound",
        id: "3",
        onActivate: noop,
        relation: "calls",
        target: "ranker",
      },
    ],
  },
  component: RelationshipInspector,
  decorators: [
    (Story) => (
      <div className="w-72">
        <Story />
      </div>
    ),
  ],
  title: "Canvas/RelationshipInspector",
} satisfies Meta<typeof RelationshipInspector>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Empty: Story = {
  args: { edges: [] },
};

export const InboundOnly: Story = {
  args: {
    edges: [
      {
        direction: "inbound",
        id: "1",
        relation: "spawned-by",
        target: "research-orchestrator",
      },
    ],
  },
};

export const NonInteractive: Story = {
  args: {
    edges: [
      {
        direction: "inbound",
        id: "1",
        relation: "spawned-by",
        target: "research-2025",
      },
      {
        direction: "outbound",
        id: "2",
        relation: "emits",
        target: "summary.md",
      },
    ],
  },
};
