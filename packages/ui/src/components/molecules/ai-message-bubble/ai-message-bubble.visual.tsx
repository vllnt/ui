import { expect, test } from "@playwright/experimental-ct-react";

import { AIMessageBubble } from "./ai-message-bubble";

test.describe("AIMessageBubble Visual", () => {
  test("default", async ({ mount, page }) => {
    await mount(
      <div className="max-w-3xl space-y-4 p-6">
        <AIMessageBubble author="Assistant" timestamp="Just now">
          I found the slow query. It is waiting on an unindexed filter in the
          audit log table.
        </AIMessageBubble>
        <AIMessageBubble author="You" messageRole="user" timestamp="1m ago">
          Can you suggest the lowest-risk fix?
        </AIMessageBubble>
      </div>,
    );

    await expect(page).toHaveScreenshot("ai-message-bubble-default.png");
  });
});
