import { expect, test } from "@playwright/experimental-ct-react";

import { FloatingToolbar } from "./floating-toolbar";

const noop = (): void => undefined;

test.describe("FloatingToolbar Visual", () => {
  test("default", async ({ mount }) => {
    const component = await mount(
      <div className="relative h-[180px] w-[480px] rounded-2xl border bg-muted/30">
        <FloatingToolbar
          actions={[
            { id: "rename", label: "Rename", onActivate: noop, variant: "primary" },
            { id: "duplicate", label: "Duplicate", onActivate: noop },
            { id: "delete", label: "Delete", onActivate: noop, variant: "destructive" },
          ]}
          x={120}
          y={120}
        />
      </div>,
    );
    await expect(component).toHaveScreenshot(
      "floating-toolbar-default.png",
    );
  });
});
