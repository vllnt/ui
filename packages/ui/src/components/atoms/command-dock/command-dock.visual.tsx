import { expect, test } from "@playwright/experimental-ct-react";

import { CommandDock } from "./command-dock";

const noop = (): void => undefined;

test.describe("CommandDock Visual", () => {
  test("default", async ({ mount }) => {
    const component = await mount(
      <div className="flex items-center justify-center bg-muted/40 p-8">
        <CommandDock
          actions={[
            {
              glyph: "+",
              id: "summon",
              label: "Summon",
              onActivate: noop,
              tone: "primary",
            },
            {
              badge: "3",
              glyph: "✓",
              id: "review",
              label: "Review",
              onActivate: noop,
              tone: "success",
            },
            {
              glyph: "↻",
              id: "retry",
              label: "Retry",
              onActivate: noop,
            },
            {
              glyph: "⏵",
              id: "play",
              label: "Play",
              onActivate: noop,
            },
            {
              glyph: "⏸",
              id: "pause",
              label: "Pause",
              onActivate: noop,
              tone: "danger",
            },
          ]}
          onOpenPalette={noop}
        />
      </div>,
    );
    await expect(component).toHaveScreenshot("command-dock-default.png");
  });
});
