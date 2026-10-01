import type { Meta, StoryObj } from "@storybook/react-vite";

import { ActivityLog } from "./activity-log";

const meta = {
  args: {
    description: "Paginated audit history for recent analytics changes.",
    items: [
      {
        action: "updated",
        actor: "Alex Morgan",
        description: "Raised ingestion retention from 30 to 45 days.",
        id: "1",
        scope: "Workspace",
        target: "Analytics policy",
        timestamp: "2m ago",
        tone: "success",
      },
      {
        action: "paused",
        actor: "Riley Chen",
        description: "Temporarily disabled streaming exports after an alert.",
        id: "2",
        scope: "Project",
        target: "Billing pipeline",
        timestamp: "11m ago",
        tone: "warning",
      },
      {
        action: "revoked",
        actor: "Sam Patel",
        description: "Removed an expired API credential from production scope.",
        id: "3",
        scope: "Environment",
        target: "Collector token",
        timestamp: "24m ago",
        tone: "danger",
      },
      {
        action: "reviewed",
        actor: "Jordan Lee",
        description: "Confirmed attribution rules for weekend experiment traffic.",
        id: "4",
        scope: "Project",
        target: "Experiment dashboard",
        timestamp: "46m ago",
      },
    ],
    pageSize: 3,
    title: "Activity log",
  },
  component: ActivityLog,
  title: "Analytics/ActivityLog",
} satisfies Meta<typeof ActivityLog>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Empty: Story = {
  args: {
    items: [],
  },
};
