import { expect, test } from "@playwright/experimental-ct-react";

import { AISourceCitation } from "./ai-source-citation";

test.describe("AISourceCitation Visual", () => {
  test("default", async ({ mount, page }) => {
    await mount(
      <div className="max-w-md p-6">
        <AISourceCitation
          href="https://example.com/research/agent-patterns"
          snippet="This pattern keeps citations compact while preserving the original source label and a readable excerpt."
          source="Research memo"
          title="Compact citation chips for AI answers"
        />
      </div>,
    );

    await expect(page).toHaveScreenshot("ai-source-citation-default.png");
  });
});
