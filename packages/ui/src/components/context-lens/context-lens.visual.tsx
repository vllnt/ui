import { expect, test } from "@playwright/experimental-ct-react";

import { ContextLens } from "./context-lens";

test.describe("ContextLens Visual", () => {
  test("default", async ({ mount }) => {
    const component = await mount(
      <div
        className="relative overflow-hidden rounded-lg border bg-gradient-to-br from-blue-500/40 to-emerald-500/40"
        style={{ height: 320, width: 480 }}
      >
        <div className="absolute inset-0 grid grid-cols-6 grid-rows-4 gap-2 p-3">
          {Array.from({ length: 24 }).map((_, idx) => (
            <div
              className="rounded-md bg-white/40"
              key={`tile-${idx}`}
            />
          ))}
        </div>
        <ContextLens focus={{ cx: 240, cy: 160, inner: 60, outer: 160 }} />
      </div>,
    );
    await expect(component).toHaveScreenshot("context-lens-default.png");
  });
});
