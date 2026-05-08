import { expect, test } from "@playwright/experimental-ct-react";

import { WorldBreadcrumbs } from "./world-breadcrumbs";

test.describe("WorldBreadcrumbs Visual", () => {
  test("default", async ({ mount }) => {
    const component = await mount(
      <div className="p-4">
        <WorldBreadcrumbs
          crumbs={[
            { id: "ws", label: "Acme" },
            { id: "proj", label: "Q4 launch", meta: "v2" },
            { id: "board", label: "Operations" },
            { id: "view", label: "Release timeline" },
          ]}
        />
      </div>,
    );
    await expect(component).toHaveScreenshot(
      "world-breadcrumbs-default.png",
    );
  });
});
