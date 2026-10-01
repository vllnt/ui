import { expect, test } from "@playwright/experimental-ct-react";

import { Annotation } from "./annotation";

test.describe("Annotation Visual", () => {
  test("default", async ({ mount, page }) => {
    await mount(
      <div className="max-w-2xl p-6 text-sm leading-7">
        <p>
          Use an <Annotation annotation="This is a concise note that expands the highlighted phrase.">annotation</Annotation> to reveal additional context without breaking the reading flow.
        </p>
      </div>,
    );

    await expect(page).toHaveScreenshot("annotation-default.png");
  });
});
