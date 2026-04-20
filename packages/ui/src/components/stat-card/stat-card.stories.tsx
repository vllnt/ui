import { Activity, DollarSign, TrendingUp } from "lucide-react";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { StatCard } from "./stat-card";

const meta = {
  args: {
    change: "+8.2%",
    description: "Monthly recurring revenue",
    icon: <DollarSign className="h-4 w-4" />,
    label: "MRR",
    meta: "vs last month",
    tone: "success",
    trend: "up",
    value: "$42.8k",
  },
  component: StatCard,
  title: "Data/StatCard",
} satisfies Meta<typeof StatCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Grid: Story = {
  render: () => (
    <div className="grid gap-4 md:grid-cols-3">
      <StatCard
        change="+8.2%"
        description="Monthly recurring revenue"
        icon={<DollarSign className="h-4 w-4" />}
        label="MRR"
        meta="vs last month"
        tone="success"
        trend="up"
        value="$42.8k"
      />
      <StatCard
        change="+3.1 pts"
        description="Onboarding completion"
        icon={<TrendingUp className="h-4 w-4" />}
        label="Activation"
        meta="Trailing 7 days"
        tone="neutral"
        trend="up"
        value="71%"
      />
      <StatCard
        change="-12 ms"
        description="Average API response time"
        icon={<Activity className="h-4 w-4" />}
        label="Latency"
        meta="p95 · us-east-1"
        tone="warning"
        trend="down"
        value="184ms"
      />
    </div>
  ),
};