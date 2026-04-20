import { expect, test } from "@playwright/experimental-ct-react";

import { ScopeSelector } from "./scope-selector";

test.describe("ScopeSelector Visual", () => {
  test("default", async ({ mount, page }) => {
    await mount(
      <div className="w-[420px] p-6">
        <ScopeSelector
          nodes={[
            {
              children: [
                {
                  children: [
                    { id: "prod-us", label: "US East" },
                    { id: "prod-eu", label: "EU West" },
                  ],
                  id: "production",
                  label: "Production",
                },
                {
                  children: [{ id: "stage-us", label: "US East" }],
                  id: "staging",
                  label: "Staging",
                },
              ],
              id: "environments",
              label: "Environments",
            },
            {
              children: [
                { id: "team-growth", label: "Growth" },
                { id: "team-data", label: "Data" },
              ],
              id: "teams",
              label: "Teams",
            },
          ]}
        />
      </div>,
    );

    await expect(page).toHaveScreenshot("scope-selector-default.png");
  });
});
