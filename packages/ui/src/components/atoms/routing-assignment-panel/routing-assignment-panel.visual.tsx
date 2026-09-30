import { expect, test } from "@playwright/experimental-ct-react";

import { RoutingAssignmentPanel } from "./routing-assignment-panel";

test.describe("RoutingAssignmentPanel Visual", () => {
  test("default", async ({ mount }) => {
    const component = await mount(
      <div className="w-72 p-4">
        <RoutingAssignmentPanel
          assignments={[
            { agent: "researcher", id: "1", load: 0.82, role: "primary" },
            {
              agent: "researcher-mini",
              id: "2",
              load: 0.04,
              role: "fallback",
            },
            { agent: "shadow-eval", id: "3", role: "shadow" },
          ]}
        />
      </div>,
    );
    await expect(component).toHaveScreenshot(
      "routing-assignment-panel-default.png",
    );
  });
});
