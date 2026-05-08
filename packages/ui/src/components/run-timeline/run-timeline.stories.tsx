import type { Meta, StoryObj } from "@storybook/react-vite";

import { RunTimeline } from "./run-timeline";

const noop = (): void => undefined;

const meta = {
  args: {
    cursor: 1800,
    end: 3600,
    formatValue: (v: number) => `${Math.round(v / 60)}m`,
    lanes: [
      { id: "ingest", label: "Ingest" },
      { id: "rank", label: "Rank" },
      { id: "emit", label: "Emit" },
    ],
    phases: [
      {
        end: 600,
        id: "i1",
        label: "load",
        laneId: "ingest",
        onActivate: noop,
        start: 0,
        state: "complete",
      },
      {
        end: 720,
        id: "i2",
        label: "tag",
        laneId: "ingest",
        onActivate: noop,
        start: 600,
        state: "complete",
      },
      {
        end: 2200,
        id: "r1",
        label: "score",
        laneId: "rank",
        onActivate: noop,
        start: 800,
        state: "running",
      },
      {
        end: 1500,
        id: "r2",
        label: "filter",
        laneId: "rank",
        onActivate: noop,
        start: 1200,
        state: "failed",
      },
      {
        end: 3600,
        id: "e1",
        label: "publish",
        laneId: "emit",
        onActivate: noop,
        start: 2300,
        state: "queued",
      },
    ],
    start: 0,
  },
  component: RunTimeline,
  decorators: [
    (Story) => (
      <div className="w-[540px]">
        <Story />
      </div>
    ),
  ],
  title: "Canvas/RunTimeline",
} satisfies Meta<typeof RunTimeline>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const SingleLane: Story = {
  args: {
    lanes: undefined,
    phases: [
      { end: 1200, id: "1", label: "warm", start: 0, state: "complete" },
      { end: 2400, id: "2", label: "run", start: 1200, state: "running" },
      { end: 3600, id: "3", label: "cool", start: 2400, state: "queued" },
    ],
  },
};

export const NoCursor: Story = {
  args: { cursor: undefined },
};

export const Empty: Story = {
  args: { phases: [] },
};
