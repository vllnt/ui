import { expect, test } from "@playwright/experimental-ct-react";

import { type ThreadReply, ThreadBubble } from "./thread-bubble";

const REPLIES: ThreadReply[] = [
  {
    body: "We should reword this. The current copy reads passive.",
    id: "1",
    timestamp: "2026-05-08T09:00:00Z",
    user: "Sam",
  },
  {
    body: "Agreed — drafting a fix.",
    id: "2",
    timestamp: "2026-05-08T09:05:00Z",
    user: "Wei",
  },
  {
    body: "Pushed to staging.",
    id: "3",
    timestamp: "2026-05-08T09:32:00Z",
    user: "Riley",
  },
];

test.describe("ThreadBubble Visual", () => {
  test("default", async ({ mount }) => {
    const component = await mount(
      <div className="p-4">
        <ThreadBubble replies={REPLIES} title="Trade-off summary" />
      </div>,
    );
    await expect(component).toHaveScreenshot("thread-bubble-default.png");
  });
});
