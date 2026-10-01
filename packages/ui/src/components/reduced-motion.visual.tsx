import { expect, test } from "@playwright/experimental-ct-react";

import { Skeleton } from "./atoms/skeleton/skeleton";
import { Spinner } from "./atoms/spinner/spinner";

// Real-browser check of the shipped styles.css under prefers-reduced-motion:
// library components stop (or slow) their own motion, while an animation the
// consuming app owns is left exactly as the app wrote it.
test.describe("prefers-reduced-motion", () => {
  test.beforeEach(async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
  });

  test("leaves a consumer element's animation untouched", async ({
    mount,
    page,
  }) => {
    await mount(
      <div>
        <style>{"@keyframes consumer-spin { to { transform: rotate(1turn); } }"}</style>
        <div
          data-testid="consumer"
          style={{
            animation: "consumer-spin 1s linear infinite",
            transition: "opacity 300ms ease",
          }}
        >
          Consumer
        </div>
      </div>,
    );
    const timing = await page.getByTestId("consumer").evaluate((element) => {
      const style = getComputedStyle(element);
      return {
        duration: style.animationDuration,
        iterations: style.animationIterationCount,
        name: style.animationName,
        reduce: matchMedia("(prefers-reduced-motion: reduce)").matches,
        transition: style.transitionDuration,
      };
    });
    expect(timing).toEqual({
      duration: "1s",
      iterations: "infinite",
      name: "consumer-spin",
      reduce: true,
      transition: "0.3s",
    });
  });

  test("stops library pulses and slows the essential spinner", async ({
    mount,
    page,
  }) => {
    await mount(
      <div>
        <Skeleton data-testid="skeleton" />
        <Spinner data-testid="spinner" />
      </div>,
    );
    const skeleton = await page
      .getByTestId("skeleton")
      .evaluate((element) => getComputedStyle(element).animationName);
    const spinner = await page.getByTestId("spinner").evaluate((element) => ({
      duration: getComputedStyle(element).animationDuration,
      name: getComputedStyle(element).animationName,
    }));
    expect(skeleton).toBe("none");
    expect(spinner).toEqual({ duration: "1.5s", name: "spin" });
  });
});
