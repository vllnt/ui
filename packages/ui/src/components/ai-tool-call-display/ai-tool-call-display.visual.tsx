import { expect, test } from "@playwright/experimental-ct-react";

import { AIToolCallDisplay } from "./ai-tool-call-display";

test.describe("AIToolCallDisplay Visual", () => {
  test("default", async ({ mount, page }) => {
    await mount(
      <div className="max-w-2xl p-6">
        <AIToolCallDisplay
          description="Ran a targeted search across the workspace for registry preview wiring."
          duration="0.4s"
          input='{"pattern":"component-preview"}'
          output='{"matches":5}'
          status="complete"
          toolName="search_files"
        />
      </div>,
    );

    await expect(page).toHaveScreenshot("ai-tool-call-display-default.png");
  });
});
