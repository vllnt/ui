import type { Meta, StoryObj } from "@storybook/react-vite";

import { GanttChart, type GanttGroup } from "./gantt-chart";

const GROUPS: GanttGroup[] = [
  {
    id: "phase-1",
    name: "Phase 1: Foundation",
    tasks: [
      {
        assignee: "Alice",
        color: "blue",
        end: "2026-02-28",
        id: "design",
        progress: 100,
        start: "2026-01-15",
        title: "Design system",
      },
      {
        assignee: "Bob",
        color: "emerald",
        end: "2026-04-15",
        id: "core",
        progress: 65,
        start: "2026-02-01",
        title: "Core components",
      },
    ],
  },
  {
    id: "phase-2",
    name: "Phase 2: Polish",
    tasks: [
      {
        color: "amber",
        end: "2026-05-31",
        id: "docs",
        progress: 30,
        start: "2026-03-15",
        title: "Documentation",
      },
      {
        color: "purple",
        end: "2026-06-30",
        id: "tests",
        progress: 10,
        start: "2026-04-01",
        title: "Test coverage",
      },
    ],
  },
];

const meta = {
  args: {
    endDate: "2026-06-30",
    groups: GROUPS,
    milestones: [
      { date: "2026-04-15", id: "v1", title: "v1.0" },
      { date: "2026-06-15", id: "v2", title: "v2.0" },
    ],
    now: "2026-03-01",
    scale: "month",
    startDate: "2026-01-01",
  },
  argTypes: {
    scale: {
      control: "select",
      options: ["day", "week", "month", "quarter"],
    },
  },
  component: GanttChart,
  title: "Data/GanttChart",
} satisfies Meta<typeof GanttChart>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const QuarterScale: Story = {
  args: {
    endDate: "2027-06-30",
    scale: "quarter",
    startDate: "2026-01-01",
  },
};

export const SingleGroup: Story = {
  args: {
    groups: [GROUPS[0]],
  },
};

export const NoMilestones: Story = {
  args: {
    milestones: [],
  },
};
