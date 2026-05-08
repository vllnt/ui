import { expect, test } from "@playwright/experimental-ct-react";

import { ViewportBookmarks } from "./viewport-bookmarks";

test.describe("ViewportBookmarks Visual", () => {
  test("default", async ({ mount }) => {
    const component = await mount(
      <div className="w-64 bg-muted/30 p-4">
        <ViewportBookmarks
          activeId="incidents"
          bookmarks={[
            { color: "#5b8def", id: "home", label: "Home base" },
            { color: "#10b981", detail: "1.4× zoom", id: "drilldown", label: "Drill-down" },
            { color: "#ef4444", detail: "5 open", id: "incidents", label: "Incidents" },
            { color: "#f59e0b", id: "watchtower", label: "Watch tower" },
          ]}
        />
      </div>,
    );
    await expect(component).toHaveScreenshot(
      "viewport-bookmarks-default.png",
    );
  });
});
