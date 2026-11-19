import { expect, test } from "@playwright/experimental-ct-react";

import { Scrim, type ScrimLevel } from "./scrim";

function surface(level: ScrimLevel): React.JSX.Element {
  return (
    <div className="relative h-64 w-full overflow-hidden rounded-xl border bg-card p-4 text-sm">
      <p>
        Content sits beneath the scrim. The overlay is flat black in every theme
        mode.
      </p>
      <Scrim level={level} />
    </div>
  );
}

test.describe("Scrim Visual", () => {
  test("dim", async ({ mount, page }) => {
    await mount(surface("dim"));
    await expect(page).toHaveScreenshot("scrim-dim.png");
  });

  test("strong", async ({ mount, page }) => {
    await mount(surface("strong"));
    await expect(page).toHaveScreenshot("scrim-strong.png");
  });

  test("mobile 390", async ({ mount, page }) => {
    const errors: string[] = [];
    page.on("console", (message) => {
      if (message.type() === "error") errors.push(message.text());
    });
    page.on("pageerror", (error) => errors.push(String(error)));
    await page.setViewportSize({ height: 844, width: 390 });
    await mount(surface("strong"));
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
    await expect(page).toHaveScreenshot("scrim-mobile.png");
    expect(errors).toEqual([]);
  });
});
