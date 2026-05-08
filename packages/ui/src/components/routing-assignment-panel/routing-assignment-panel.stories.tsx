import type { Meta, StoryObj } from "@storybook/react-vite";

import { RoutingAssignmentPanel } from "./routing-assignment-panel";

const noop = (): void => undefined;

const meta = {
  args: {
    assignments: [
      {
        agent: "researcher",
        id: "1",
        load: 0.82,
        onActivate: noop,
        role: "primary",
      },
      {
        agent: "researcher-mini",
        id: "2",
        load: 0.04,
        onActivate: noop,
        role: "fallback",
      },
      { agent: "shadow-eval", id: "3", onActivate: noop, role: "shadow" },
    ],
  },
  component: RoutingAssignmentPanel,
  decorators: [
    (Story) => (
      <div className="w-72">
        <Story />
      </div>
    ),
  ],
  title: "Canvas/RoutingAssignmentPanel",
} satisfies Meta<typeof RoutingAssignmentPanel>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Empty: Story = {
  args: { assignments: [] },
};

export const PrimaryOnly: Story = {
  args: {
    assignments: [
      { agent: "researcher", id: "1", load: 0.42, role: "primary" },
    ],
  },
};

export const NonInteractive: Story = {
  args: {
    assignments: [
      { agent: "researcher", id: "1", load: 0.82, role: "primary" },
      { agent: "researcher-mini", id: "2", load: 0.04, role: "fallback" },
    ],
  },
};
