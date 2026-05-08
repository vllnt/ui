import type { Meta, StoryObj } from "@storybook/react-vite";

import { PresenceStack } from "./presence-stack";

const noop = (): void => undefined;

const meta = {
  args: {
    max: 4,
    onOverflowActivate: noop,
    users: [
      { color: "#5b8def", id: "1", initial: "B", name: "Bea" },
      { color: "#10b981", id: "2", initial: "L", name: "Lior", status: "away" },
      { color: "#f59e0b", id: "3", initial: "S", name: "Sam", status: "idle" },
      { color: "#a855f7", id: "4", initial: "M", name: "Mira" },
      { color: "#ef4444", id: "5", initial: "R", name: "Rae", status: "offline" },
      { color: "#0ea5e9", id: "6", initial: "K", name: "Kim" },
    ],
  },
  component: PresenceStack,
  decorators: [
    (Story) => (
      <div className="bg-muted/30 p-4">
        <Story />
      </div>
    ),
  ],
  title: "Canvas/PresenceStack",
} satisfies Meta<typeof PresenceStack>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Solo: Story = {
  args: {
    users: [
      { color: "#5b8def", id: "1", initial: "B", name: "Bea" },
    ],
  },
};

export const NoOverflow: Story = {
  args: {
    max: 10,
    onOverflowActivate: undefined,
  },
};

export const AllAway: Story = {
  args: {
    users: [
      { color: "#5b8def", id: "1", initial: "B", name: "Bea", status: "away" },
      { color: "#10b981", id: "2", initial: "L", name: "Lior", status: "idle" },
      { color: "#f59e0b", id: "3", initial: "S", name: "Sam", status: "offline" },
    ],
  },
};
