import { expect, test } from "@playwright/experimental-ct-react";

import { AnimatedText } from "./animated-text";

test.describe("AnimatedText Visual", () => {
  test("default", async ({ mount, page }) => {
    await page.addStyleTag({
      content:
        "*, *::before, *::after { animation: none !important; transition: none !important; } .opacity-0 { opacity: 1 !important; }",
    });

    const component = await mount(
      <div className="max-w-xl rounded-lg border p-6">
        <AnimatedText className="text-3xl font-semibold" text="Ship motion that still feels like the current system." />
      </div>,
    );

    await expect(component).toHaveScreenshot("animated-text-default.png");
  });
});
