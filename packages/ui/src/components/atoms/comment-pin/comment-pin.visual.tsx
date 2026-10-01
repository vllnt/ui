import { expect, test } from "@playwright/experimental-ct-react";

import { CommentPin } from "./comment-pin";

test.describe("CommentPin Visual", () => {
  test("default", async ({ mount }) => {
    const component = await mount(
      <div
        className="relative bg-muted/30"
        style={{ height: 240, width: 360 }}
      >
        <CommentPin authorInitial="B" color="#5b8def" unread={3} x={90} y={80} />
        <CommentPin authorInitial="L" color="#10b981" x={200} y={140} />
        <CommentPin authorInitial="S" state="resolved" x={300} y={200} />
      </div>,
    );
    await expect(component).toHaveScreenshot("comment-pin-default.png");
  });
});
