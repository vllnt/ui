import { expect, test } from "@playwright/experimental-ct-react";

import { ProgressBar } from "./progress-bar";

const blocksBar = (
  <div style={{ width: 400 }}>
    <div className="bg-primary" data-testid="ref-primary" />
    <div className="bg-muted" data-testid="ref-muted" />
    <ProgressBar blocks label="Upload" max={100} value={35} />
  </div>
);

test.describe("ProgressBar blocks", () => {
  test("draws ten equal blocks and fills three of them", async ({
    mount,
    page,
  }) => {
    await mount(blocksBar);
    const bar = page.getByRole("progressbar", { name: "Upload" });
    const cells = bar.locator(":scope > div");
    await expect(cells).toHaveCount(10);

    const widths = await cells.evaluateAll((elements) =>
      elements.map((element) => element.getBoundingClientRect().width),
    );
    for (const width of widths) {
      expect(width).toBeGreaterThan(0);
      expect(Math.abs(width - (widths[0] ?? 0))).toBeLessThan(1);
    }

    const backgrounds = await cells.evaluateAll((elements) =>
      elements.map((element) => getComputedStyle(element).backgroundColor),
    );
    const colour = (testId: string) =>
      page
        .getByTestId(testId)
        .evaluate((element) => getComputedStyle(element).backgroundColor);
    const primary = await colour("ref-primary");
    const muted = await colour("ref-muted");
    expect(primary).not.toBe(muted);
    expect(backgrounds).toEqual([
      ...Array.from({ length: 3 }, () => primary),
      ...Array.from({ length: 7 }, () => muted),
    ]);
    await expect(bar).toHaveAttribute("aria-valuenow", "35");
  });

  test("block and fill transitions run by default and stop under reduced motion", async ({
    mount,
    page,
  }) => {
    await mount(
      <div style={{ width: 400 }}>
        <ProgressBar blocks label="Blocks" max={100} value={35} />
        <ProgressBar label="Continuous" max={100} value={35} />
      </div>,
    );
    const property = (name: string) =>
      page
        .getByRole("progressbar", { name })
        .locator(":scope > div")
        .first()
        .evaluate((element) => getComputedStyle(element).transitionProperty);

    await page.emulateMedia({ reducedMotion: "no-preference" });
    expect(await property("Blocks")).not.toBe("none");
    expect(await property("Continuous")).not.toBe("none");

    await page.emulateMedia({ reducedMotion: "reduce" });
    expect(await property("Blocks")).toBe("none");
    expect(await property("Continuous")).toBe("none");
  });
});
