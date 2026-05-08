import { expect, test } from "@playwright/experimental-ct-react";

import { ObjectInspector } from "./object-inspector";

test.describe("ObjectInspector Visual", () => {
  test("default", async ({ mount }) => {
    const component = await mount(
      <div className="w-72 p-4">
        <ObjectInspector
          kind="run"
          status="running"
          subtitle="claude-3.7 · 128k ctx"
          title="research-2025-04-15"
        >
          <p className="rounded-md border border-border/60 bg-muted/30 px-2 py-1 text-xs text-muted-foreground">
            Property sections render here.
          </p>
        </ObjectInspector>
      </div>,
    );
    await expect(component).toHaveScreenshot(
      "object-inspector-default.png",
    );
  });
});
