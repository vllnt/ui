import type { Meta, StoryObj } from "@storybook/react-vite";

import { BottomActivityStrip } from "./bottom-activity-strip";

const noop = (): void => undefined;

const meta = {
  args: {
    events: [
      { id: "1", label: "deploy ok", onActivate: noop, tone: "success", ts: "12s" },
      { id: "2", label: "queue spike", onActivate: noop, tone: "warn", ts: "1m" },
      { id: "3", label: "alert resolved", onActivate: noop, tone: "info", ts: "3m" },
      { id: "4", label: "p95 trip", onActivate: noop, tone: "danger", ts: "5m" },
      { id: "5", label: "agent idle", onActivate: noop, ts: "8m" },
    ],
  },
  component: BottomActivityStrip,
  decorators: [
    (Story) => (
      <div className="w-[480px]">
        <Story />
      </div>
    ),
  ],
  title: "Canvas/BottomActivityStrip",
} satisfies Meta<typeof BottomActivityStrip>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Empty: Story = {
  args: { events: [] },
};

export const Capped: Story = {
  args: { maxEvents: 3 },
};

export const NonInteractive: Story = {
  args: {
    events: [
      { id: "1", label: "deploy ok", tone: "success", ts: "12s" },
      { id: "2", label: "queue spike", tone: "warn", ts: "1m" },
    ],
  },
};
