import { expect, test } from "@playwright/experimental-ct-react";

import { PresenceStack } from "./presence-stack";

test.describe("PresenceStack Visual", () => {
  test("default", async ({ mount }) => {
    const component = await mount(
      <div className="space-y-3 p-4">
        <PresenceStack
          members={[
            { color: "emerald", id: "sam", name: "Sam Smith" },
            { id: "riley", name: "Riley", status: "idle" },
            { color: "rose", id: "wei", name: "Wei" },
            { id: "jordan", name: "Jordan Doe" },
            { id: "alex", name: "Alex" },
            { id: "morgan", name: "Morgan" },
          ]}
        />
      </div>,
    );
    await expect(component).toHaveScreenshot(
      "presence-stack-default.png",
    );
  });
});
