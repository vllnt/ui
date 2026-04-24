import { expect, test } from "@playwright/experimental-ct-react";

import { SeverityBadge } from "./severity-badge";

test.describe("SeverityBadge Visual", () => {
  test("levels", async ({ mount, page }) => {
    await mount(
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, padding: 16 }}>
        <SeverityBadge level="critical" />
        <SeverityBadge level="high" />
        <SeverityBadge level="medium" />
        <SeverityBadge level="low" />
        <SeverityBadge level="info" />
      </div>,
    );
    await expect(page).toHaveScreenshot("severity-badge-levels.png");
  });

  test("tones", async ({ mount, page }) => {
    await mount(
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, padding: 16 }}>
        <SeverityBadge level="critical" tone="solid" />
        <SeverityBadge level="critical" tone="soft" />
        <SeverityBadge level="critical" tone="outline" />
      </div>,
    );
    await expect(page).toHaveScreenshot("severity-badge-tones.png");
  });
});
