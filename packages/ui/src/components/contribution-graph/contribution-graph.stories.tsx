import type { Meta, StoryObj } from "@storybook/react-vite";

import {
  ContributionGraph,
  type ContributionDay,
} from "./contribution-graph";

function sampleYear(): ContributionDay[] {
  const days: ContributionDay[] = [];
  const start = Date.UTC(2026, 0, 4);
  for (let index = 0; index < 364; index += 1) {
    const date = new Date(start + index * 24 * 60 * 60 * 1000)
      .toISOString()
      .slice(0, 10);
    const wave = Math.round(3 + 3 * Math.sin(index / 9));
    days.push({ count: Math.max(0, (index % 5 === 0 ? 0 : wave)), date });
  }
  return days;
}

const meta = {
  args: {
    className: "text-primary",
    data: sampleYear(),
  },
  component: ContributionGraph,
  title: "Data/ContributionGraph",
} satisfies Meta<typeof ContributionGraph>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const LastTwelveWeeks: Story = {
  args: { weeks: 12 },
};
