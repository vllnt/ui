import type { Meta, StoryObj } from "@storybook/react-vite";

import { ActivityHeatmap } from "./activity-heatmap";

const meta = {
  args: {
    data: [
      { count: 1, date: "2026-03-01" },
      { count: 3, date: "2026-03-02" },
      { count: 6, date: "2026-03-03" },
      { count: 4, date: "2026-03-05" },
      { count: 9, date: "2026-03-08" },
      { count: 7, date: "2026-03-11" },
      { count: 2, date: "2026-03-13" },
    ],
    description: "Twelve-week view of deploys, incidents, and recoveries.",
    endDate: "2026-03-14T00:00:00.000Z",
    title: "Deployment activity",
    weeks: 12,
  },
  component: ActivityHeatmap,
  title: "Data/ActivityHeatmap",
} satisfies Meta<typeof ActivityHeatmap>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const TwoWeeks: Story = {
  args: {
    weeks: 2,
  },
};
