import { BarChart3, TrendingUp } from "lucide-react";
import { expect, test } from "@playwright/experimental-ct-react";

import { StatCard } from "./stat-card";

test.describe("StatCard Visual", () => {
  test("grid", async ({ mount, page }) => {
    await mount(
      <div className="grid w-[720px] grid-cols-2 gap-4 p-4">
        <StatCard
          change="+8.2%"
          description="Monthly recurring revenue"
          icon={<TrendingUp className="h-4 w-4" />}
          label="MRR"
          meta="vs last month"
          tone="success"
          trend="up"
          value="$42.8k"
        />
        <StatCard
          change="-1.6%"
          description="Average response time"
          icon={<BarChart3 className="h-4 w-4" />}
          label="API latency"
          meta="p95 · 24h"
          tone="warning"
          trend="down"
          value="184ms"
        />
      </div>,
    );

    await expect(page).toHaveScreenshot("stat-card-grid.png");
  });
});