import { expect, test } from "@playwright/experimental-ct-react";

import { FollowMode } from "./follow-mode";

test.describe("FollowMode Visual", () => {
  test("default", async ({ mount }) => {
    const component = await mount(
      <div className="h-[280px] w-[480px] p-2">
        <FollowMode color="emerald" name="Sam" onStop={() => undefined}>
          <div className="flex h-full w-full items-center justify-center bg-muted/20 text-sm text-muted-foreground">
            <span>Followed canvas content</span>
          </div>
        </FollowMode>
      </div>,
    );
    await expect(component).toHaveScreenshot("follow-mode-default.png");
  });
});
