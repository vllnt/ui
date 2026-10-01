import { expect, test } from "@playwright/experimental-ct-react";

import { AnimatedText } from "./animated-text";

test.describe("AnimatedText Visual", () => {
  test("terminal", async ({ mount, page }) => {
    await page.addStyleTag({
      content:
        "*, *::before, *::after { animation: none !important; transition: none !important; } .opacity-0 { opacity: 1 !important; }",
    });

    const component = await mount(
      <div className="max-w-xl rounded-lg border p-6">
        <AnimatedText className="text-3xl font-semibold" text="BOOTING VLLNT INTERFACE..." />
      </div>,
    );

    await expect(component).toHaveScreenshot("animated-text-terminal.png");
  });
});
