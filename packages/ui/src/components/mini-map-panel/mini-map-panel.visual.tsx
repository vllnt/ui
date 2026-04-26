import { expect, test } from "@playwright/experimental-ct-react";

import { MiniMapPanel } from "./mini-map-panel";

test.describe("MiniMapPanel Visual", () => {
  test("default", async ({ mount, page }) => {
    await mount(
      <MiniMapPanel
        markers={[
          { id: "run", label: "Run stream", x: 320, y: 240 },
          { id: "knowledge", label: "Knowledge cluster", x: 820, y: 420 },
          { id: "agent", label: "Agent loop", x: 1120, y: 760 },
        ]}
        viewport={{ height: 360, width: 520, x: 300, y: 180, zoom: 1 }}
        world={{ height: 1200, width: 1600 }}
      />,
    );
    await expect(page).toHaveScreenshot("mini-map-panel-default.png");
  });
});
