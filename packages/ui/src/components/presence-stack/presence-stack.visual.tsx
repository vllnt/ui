import { expect, test } from "@playwright/experimental-ct-react";

import { PresenceStack } from "./presence-stack";

test.describe("PresenceStack Visual", () => {
  test("default", async ({ mount }) => {
    const component = await mount(
      <div className="bg-muted/30 p-4">
        <PresenceStack
          max={4}
          users={[
            { color: "#5b8def", id: "1", initial: "B", name: "Bea" },
            { color: "#10b981", id: "2", initial: "L", name: "Lior", status: "away" },
            { color: "#f59e0b", id: "3", initial: "S", name: "Sam", status: "idle" },
            { color: "#a855f7", id: "4", initial: "M", name: "Mira" },
            { color: "#ef4444", id: "5", initial: "R", name: "Rae", status: "offline" },
            { color: "#0ea5e9", id: "6", initial: "K", name: "Kim" },
          ]}
        />
      </div>,
    );
    await expect(component).toHaveScreenshot("presence-stack-default.png");
  });
});
