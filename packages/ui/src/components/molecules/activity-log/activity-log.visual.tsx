import { expect, test } from "@playwright/experimental-ct-react";

import { ActivityLog } from "./activity-log";

test.describe("ActivityLog Visual", () => {
  test("default", async ({ mount, page }) => {
    await mount(
      <div className="w-[780px] p-6">
        <ActivityLog
          description="Paginated audit history for recent analytics changes."
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
              description: "Removed an expired API credential from production scope.",
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
      </div>,
    );

    await expect(page).toHaveScreenshot("activity-log-default.png");
  });
});
