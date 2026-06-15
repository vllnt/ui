"use client";

import { ActivityLog } from "@vllnt/ui";

export default function ActivityLogPreview() {
  return (
    <ActivityLog
      description="Recent analytics changes across your org."
      items={[
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
          description:
            "Removed an expired API credential from production scope.",
          id: "3",
          scope: "Environment",
          target: "Collector token",
          timestamp: "24m ago",
          tone: "danger",
        },
      ]}
      pageSize={3}
      title="Activity log"
    />
  );
}
