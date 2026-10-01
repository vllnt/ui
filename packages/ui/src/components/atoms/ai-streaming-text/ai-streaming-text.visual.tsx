import { expect, test } from "@playwright/experimental-ct-react";

import { AIStreamingText } from "./ai-streaming-text";

test.describe("AIStreamingText Visual", () => {
  test("default", async ({ mount, page }) => {
    await mount(
      <div className="max-w-md p-6">
        <AIStreamingText text="The assistant summarizes the latest benchmark results in plain language." />
      </div>,
    );

    await expect(page).toHaveScreenshot("ai-streaming-text-default.png");
  });
});
