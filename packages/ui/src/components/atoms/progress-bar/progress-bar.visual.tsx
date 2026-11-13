import { expect, test } from "@playwright/experimental-ct-react";

import { ProgressBar } from "./progress-bar";

test.describe("ProgressBar Visual", () => {
  test("default", async ({ mount, page }) => {
    await mount(<ProgressBar />);
    await expect(page).toHaveScreenshot("progress-bar-default.png");
  });

  test("tones", async ({ mount, page }) => {
    await mount(
      <div className="flex w-80 flex-col gap-2 p-4">
        <ProgressBar label="Neutral" max={100} tone="neutral" value={40} />
        <ProgressBar label="Primary" max={100} tone="primary" value={40} />
        <ProgressBar label="Success" max={100} tone="success" value={40} />
        <ProgressBar label="Info" max={100} tone="info" value={40} />
        <ProgressBar label="Warning" max={100} tone="warning" value={40} />
        <ProgressBar label="Danger" max={100} tone="danger" value={40} />
      </div>,
    );
    await expect(page).toHaveScreenshot("progress-bar-tones.png");
  });

  test("sizes", async ({ mount, page }) => {
    await mount(
      <div className="flex w-80 flex-col gap-2 p-4">
        <ProgressBar label="Small" max={100} size="sm" value={60} />
        <ProgressBar label="Medium" max={100} size="md" value={60} />
        <ProgressBar label="Large" max={100} size="lg" value={60} />
      </div>,
    );
    await expect(page).toHaveScreenshot("progress-bar-sizes.png");
  });

  test("states", async ({ mount, page }) => {
    await mount(
      <div className="flex w-80 flex-col gap-2 p-4">
        <ProgressBar isComplete max={8} value={8} />
        <ProgressBar isLoading max={8} value={3} />
        <ProgressBar label="Preparing" max={8} mode="indeterminate" value={0} />
        <ProgressBar label="Step" max={8} value={3} valueLabel="3 / 8" />
        <ProgressBar label="Upload" max={8} showValue value={3} />
        <ProgressBar
          aria-label="Upload progress"
          max={8}
          showLabels={false}
          value={3}
        />
      </div>,
    );
    await expect(page).toHaveScreenshot("progress-bar-states.png");
  });

  test("mobile 390", async ({ mount, page }) => {
    const errors: string[] = [];
    page.on("console", (message) => {
      if (message.type() === "error") {
        errors.push(message.text());
      }
    });
    page.on("pageerror", (error) => errors.push(String(error)));
    await page.setViewportSize({ height: 844, width: 390 });
    await mount(
      <div className="flex w-full flex-col gap-2 p-4">
        <ProgressBar
          label="Uploading project assets"
          max={8}
          size="lg"
          tone="success"
          value={3}
          valueLabel="3 / 8"
        />
        <ProgressBar
          label="Preparing"
          max={8}
          mode="indeterminate"
          tone="info"
          value={0}
        />
      </div>,
    );
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
    await expect(page).toHaveScreenshot("progress-bar-mobile.png");
    expect(errors).toEqual([]);
  });
});
