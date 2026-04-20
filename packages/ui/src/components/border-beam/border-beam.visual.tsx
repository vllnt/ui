import { expect, test } from "@playwright/experimental-ct-react";

import { BorderBeam } from "./border-beam";

test.describe("BorderBeam Visual", () => {
  test("default", async ({ mount, page }) => {
    await page.addStyleTag({
      content:
        "*, *::before, *::after { animation: none !important; transition: none !important; }",
    });

    const component = await mount(
      <div className="relative w-[360px] rounded-xl border bg-card p-6">
        <BorderBeam />
        <div className="space-y-2">
          <div className="text-sm text-muted-foreground">Status</div>
          <div className="text-xl font-semibold">Live preview</div>
          <div className="text-sm text-muted-foreground">
            Animated border treatment for highlighted surfaces.
          </div>
        </div>
      </div>,
    );

    await expect(component).toHaveScreenshot("border-beam-default.png");
  });
});
