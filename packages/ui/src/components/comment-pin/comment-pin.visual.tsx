import { expect, test } from "@playwright/experimental-ct-react";

import { CommentPin } from "./comment-pin";

test.describe("CommentPin Visual", () => {
  test("default", async ({ mount }) => {
    const component = await mount(
      <div className="relative h-[240px] w-[480px] rounded-2xl border bg-muted/30">
        <CommentPin count={3} status="open" x={120} y={80} />
        <CommentPin initials="SS" status="unread" x={260} y={140} />
        <CommentPin count={1} status="resolved" x={380} y={50} />
      </div>,
    );
    await expect(component).toHaveScreenshot("comment-pin-default.png");
  });
});
