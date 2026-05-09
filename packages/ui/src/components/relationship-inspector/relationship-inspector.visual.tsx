import { expect, test } from "@playwright/experimental-ct-react";

import { RelationshipInspector } from "./relationship-inspector";

test.describe("RelationshipInspector Visual", () => {
  test("default", async ({ mount }) => {
    const component = await mount(
      <div className="w-72 p-4">
        <RelationshipInspector
          edges={[
            {
              direction: "inbound",
              id: "1",
              relation: "spawned-by",
              target: "run-2025-04-15",
              targetSublabel: "claude-3.7",
            },
            {
              direction: "outbound",
              id: "2",
              relation: "emits",
              target: "summary.md",
              targetSublabel: "1.2 KB",
            },
            {
              direction: "outbound",
              id: "3",
              relation: "calls",
              target: "ranker",
            },
          ]}
        />
      </div>,
    );
    await expect(component).toHaveScreenshot(
      "relationship-inspector-default.png",
    );
  });
});
