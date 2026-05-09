import { expect, test } from "@playwright/experimental-ct-react";

import { WorldBreadcrumbs } from "./world-breadcrumbs";

test.describe("WorldBreadcrumbs Visual", () => {
  test("default", async ({ mount }) => {
    const component = await mount(
      <div className="bg-muted/30 p-4">
        <WorldBreadcrumbs
          crumbs={[
            { id: "world", kind: "world", label: "Production" },
            { id: "group", kind: "group", label: "Ingest cluster" },
            { id: "run", kind: "run", label: "research-2025" },
            { id: "task", kind: "task", label: "score" },
          ]}
        />
      </div>,
    );
    await expect(component).toHaveScreenshot(
      "world-breadcrumbs-default.png",
    );
  });
});
