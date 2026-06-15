import { expect, test } from "@playwright/test";

import type { Locator, Page } from "@playwright/test";

/**
 * Blocker #2 guard — CanvasView wheel pan/zoom must work in a real browser.
 *
 * CanvasView registers a NATIVE non-passive `wheel` listener (see
 * packages/ui/src/components/canvas-view/canvas-view.tsx → useCanvasWheel)
 * specifically because React 19 marks the synthetic `onWheel` handler passive,
 * which silently drops `preventDefault()`. These tests assert two things the
 * passive regression would break:
 *   1. wheel events mutate the canvas viewport (pan / ctrl-zoom), and
 *   2. wheel events over the canvas DO NOT scroll the surrounding page
 *      (only a non-passive listener that calls preventDefault can stop that).
 *
 * Target route: /embed/canvas-view renders the real, interactive CanvasView as
 * top-level DOM (apps/registry/app/embed/[slug]/page.tsx → ComponentPreview →
 * CanvasViewPreview). The component detail page (/components/canvas-view) shows
 * the canvas inside a Storybook iframe, so the embed route is the reliable
 * top-level mount: no iframe, no contentFrame, no skip. The preview sets
 * defaultViewport={{ x: 32, y: 24, zoom: 1 }} and the interaction layer exposes
 * aria-label="Canvas workspace" with a data-viewport JSON attribute.
 */

const CANVAS_ROUTE = "/embed/canvas-view";
const CANVAS_LABEL = "Canvas workspace";
const VIEWPORT_TIMEOUT = 15_000;

type Viewport = { x: number; y: number; zoom: number };

function parseViewport(raw: null | string): Viewport {
  if (!raw) {
    throw new Error("data-viewport attribute is missing");
  }

  return JSON.parse(raw) as Viewport;
}

async function resolveCanvas(page: Page): Promise<Locator> {
  const canvas = page.getByLabel(CANVAS_LABEL).first();
  await canvas.waitFor({ state: "visible", timeout: VIEWPORT_TIMEOUT });
  await canvas.scrollIntoViewIfNeeded();
  return canvas;
}

async function readViewport(canvas: Locator): Promise<Viewport> {
  const raw = await canvas.getAttribute("data-viewport");
  return parseViewport(raw);
}

async function hoverCanvasCenter(page: Page, canvas: Locator): Promise<void> {
  const box = await canvas.boundingBox();
  if (!box) {
    throw new Error("Canvas has no bounding box");
  }

  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
}

test.describe("canvas-view wheel interactions (blocker #2)", () => {
  test("canvas pans on wheel", async ({ page }) => {
    await page.goto(CANVAS_ROUTE);
    const canvas = await resolveCanvas(page);

    const before = await readViewport(canvas);

    await hoverCanvasCenter(page, canvas);
    await page.mouse.wheel(0, 300);

    // The native non-passive listener calls nudgeViewport on a plain wheel, so
    // the serialized viewport must move once the wheel is consumed.
    await expect
      .poll(
        async () => {
          const current = await readViewport(canvas);
          return current.x !== before.x || current.y !== before.y;
        },
        { timeout: VIEWPORT_TIMEOUT },
      )
      .toBe(true);

    const after = await readViewport(canvas);
    expect(after).not.toEqual(before);
    // deltaY 300 → nudge(-deltaY) moves the canvas up (y decreases).
    expect(after.y).toBeLessThan(before.y);
  });

  test("wheel over canvas does not scroll the page (preventDefault works)", async ({
    page,
  }) => {
    await page.goto(CANVAS_ROUTE);
    const canvas = await resolveCanvas(page);

    // Make the top document scrollable so a passive listener WOULD scroll it.
    // If the listener regressed to passive (React 19 synthetic onWheel), the
    // wheel would bubble unprevented and the page would scroll. A non-passive
    // listener that calls preventDefault() keeps scrollY pinned. Comparing the
    // scrollY delta to 0 is what distinguishes passive from non-passive here.
    await page.evaluate(() => {
      const spacer = document.createElement("div");
      spacer.id = "e2e-scroll-spacer";
      spacer.style.height = "4000px";
      document.body.appendChild(spacer);
    });

    await canvas.scrollIntoViewIfNeeded();

    const scrollYBefore = await page.evaluate(() => window.scrollY);

    await hoverCanvasCenter(page, canvas);
    await page.mouse.wheel(0, 400);

    // Give any (regressed) passive scroll a chance to apply before asserting.
    await expect
      .poll(() => page.evaluate(() => window.scrollY), {
        timeout: VIEWPORT_TIMEOUT,
      })
      .toBe(scrollYBefore);

    const scrollYAfter = await page.evaluate(() => window.scrollY);
    expect(scrollYAfter - scrollYBefore).toBe(0);
  });

  test("ctrl+wheel zooms", async ({ page }) => {
    await page.goto(CANVAS_ROUTE);
    const canvas = await resolveCanvas(page);

    const before = await readViewport(canvas);

    await hoverCanvasCenter(page, canvas);
    await page.keyboard.down("Control");
    // Negative deltaY with ctrl held → zoom in (zoom increases).
    await page.mouse.wheel(0, -300);
    await page.keyboard.up("Control");

    await expect
      .poll(
        async () => {
          const current = await readViewport(canvas);
          return current.zoom;
        },
        { timeout: VIEWPORT_TIMEOUT },
      )
      .toBeGreaterThan(before.zoom);
  });
});
