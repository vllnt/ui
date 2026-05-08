import { expect, test } from "@playwright/experimental-ct-react";

import { ViewportBookmarks } from "./viewport-bookmarks";

test.describe("ViewportBookmarks Visual", () => {
  test("default", async ({ mount }) => {
    const component = await mount(
      <div className="p-4">
        <ViewportBookmarks
          activeId="release"
          bookmarks={[
            { id: "overview", label: "Overview" },
            { id: "release", label: "Release", meta: "Today" },
            { id: "incidents", label: "Incidents", meta: "Live" },
            { id: "audit", label: "Audit" },
          ]}
        />
      </div>,
    );
    await expect(component).toHaveScreenshot("viewport-bookmarks-default.png");
  });
});
