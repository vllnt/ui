import { expect, test } from "@playwright/experimental-ct-react";

import { FlowDiagram } from "./flow-diagram";

test.describe("FlowDiagram Visual", () => {
  test("default", async ({ mount, page }) => {
    await mount(<FlowDiagram />);
    await expect(page).toHaveScreenshot("flow-diagram-default.png");
  });
});
