import { expect, test } from "@playwright/experimental-ct-react";

import { Flashcard } from "./flashcard";

test.describe("Flashcard Visual", () => {
  test("default", async ({ mount, page }) => {
    await mount(
      <div className="max-w-xl p-6">
        <Flashcard
          answer="Photosynthesis converts light energy into chemical energy stored in glucose."
          category="Biology"
          question="What is the main purpose of photosynthesis?"
        />
      </div>,
    );

    await expect(page).toHaveScreenshot("flashcard-default.png");
  });
});
