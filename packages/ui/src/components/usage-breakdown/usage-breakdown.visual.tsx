import { expect, test } from "@playwright/experimental-ct-react";

import { UsageBreakdown } from "./usage-breakdown";

test.describe("UsageBreakdown Visual", () => {
  test("default", async ({ mount, page }) => {
    await mount(
      <div className="w-[720px] p-6">
        <UsageBreakdown
          description="Ranked resource consumption across your top analytics surfaces."
          items={[
            {
              id: "tokens",
              label: "Tokens",
              meta: "LLM",
              trend: { direction: "up", label: "+14%" },
              value: 420,
              valueLabel: "420k",
            },
            {
              id: "storage",
              label: "Storage",
              meta: "Vector DB",
              trend: { direction: "down", label: "-6%" },
              value: 260,
              valueLabel: "260 GB",
            },
            {
              id: "events",
              label: "Events",
              meta: "Tracking",
              value: 180,
              valueLabel: "180k",
            },
          ]}
          title="Usage breakdown"
        />
      </div>,
    );

    await expect(page).toHaveScreenshot("usage-breakdown-default.png");
  });
});
