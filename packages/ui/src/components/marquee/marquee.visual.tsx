import { expect, test } from "@playwright/experimental-ct-react";

import { Marquee } from "./marquee";

test.describe("Marquee Visual", () => {
  test("default", async ({ mount, page }) => {
    await page.addStyleTag({
      content:
        "*, *::before, *::after { animation: none !important; transition: none !important; }",
    });

    const component = await mount(
      <div className="w-[420px] rounded-lg border p-4">
        <Marquee>
          <span className="rounded-md border bg-muted px-3 py-2 text-sm">Alpha</span>
          <span className="rounded-md border bg-muted px-3 py-2 text-sm">Beta</span>
          <span className="rounded-md border bg-muted px-3 py-2 text-sm">Gamma</span>
        </Marquee>
      </div>,
    );

    await expect(component).toHaveScreenshot("marquee-default.png");
  });
});
