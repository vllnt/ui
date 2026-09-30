import { expect, test } from "@playwright/experimental-ct-react";

import { PlaybackGhost } from "./playback-ghost";

test.describe("PlaybackGhost Visual", () => {
  test("default", async ({ mount }) => {
    const component = await mount(
      <div
        className="relative bg-muted/30"
        style={{ height: 240, width: 360 }}
      >
        <div
          className="absolute rounded-md border border-border bg-background"
          style={{ height: 60, left: 200, top: 90, width: 120 }}
        />
        <PlaybackGhost
          kind="run"
          label="research-2025"
          opacity={0.4}
          x={120}
          y={120}
        />
        <PlaybackGhost
          kind="task"
          label="ingest"
          opacity={0.55}
          x={70}
          y={180}
        />
      </div>,
    );
    await expect(component).toHaveScreenshot("playback-ghost-default.png");
  });
});
