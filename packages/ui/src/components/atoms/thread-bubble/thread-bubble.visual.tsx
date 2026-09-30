import { expect, test } from "@playwright/experimental-ct-react";

import { ThreadBubble } from "./thread-bubble";

test.describe("ThreadBubble Visual", () => {
  test("default", async ({ mount }) => {
    const component = await mount(
      <div className="bg-muted/30 p-4">
        <ThreadBubble
          messages={[
            {
              author: "Bea",
              authorColor: "#5b8def",
              body: "Why are we routing to fallback right now?",
              id: "1",
              ts: "12s",
            },
            {
              author: "Lior",
              authorColor: "#10b981",
              body: "p95 spike on primary — see graph.",
              id: "2",
              ts: "9s",
            },
            {
              author: "Sam",
              authorColor: "#f59e0b",
              body: "Will keep an eye on it for the next hour.",
              id: "3",
              ts: "now",
            },
          ]}
          title="research-2025"
        />
      </div>,
    );
    await expect(component).toHaveScreenshot("thread-bubble-default.png");
  });
});
