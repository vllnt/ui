/**
 * One screenshot per Storybook story, theme and state, for the visual diff
 * (`run.mjs`). Each capture freezes what moves on its own: the clock (timers,
 * animation frames, Date), Math.random, CSS animations and SVG animations.
 * Two captures of the same build are pixel-identical.
 *
 * Every story gets a light and a dark shot. Stories whose component directory
 * is listed in VISUAL_DIFF_DEEP (comma-separated, or `all`) also get an open,
 * hover, focus and phone-width shot in each theme.
 *
 * To leave a story out, give it the `visual-skip` tag and a comment saying why.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { expect, type Page, test } from "playwright/test";

type Entry = { id: string; importPath: string; tags?: string[]; type: string };

const storybook = process.env.VISUAL_DIFF_STORYBOOK ?? "storybook-static";
const index = JSON.parse(
  readFileSync(join(storybook, "index.json"), "utf8"),
) as { entries: Record<string, Entry> };
const list = (value: string | undefined) =>
  (value ?? "").split(",").filter(Boolean);
const only = list(process.env.VISUAL_DIFF_ONLY);
const deep = list(process.env.VISUAL_DIFF_DEEP);
const [shardIndex = 1, shardCount = 1] = (
  process.env.VISUAL_DIFF_SHARD ?? "1/1"
)
  .split("/")
  .map(Number);

/** Shards by story id, so both builds split their stories the same way. */
const shardOf = (id: string) => {
  let hash = 0;
  for (const char of id) hash = Math.trunc(hash * 31 + char.codePointAt(0)!);
  return (Math.abs(hash) % shardCount) + 1;
};
const directoryOf = (entry: Entry) => entry.importPath.split("/").at(-2) ?? "";

const stories = Object.values(index.entries).filter(
  (entry) =>
    entry.type === "story" &&
    !entry.tags?.includes("visual-skip") &&
    shardOf(entry.id) === shardIndex &&
    (only.length === 0 || only.some((part) => entry.id.includes(part))),
);

/** Every capture sees the same date, so "today" markers never move. */
const FIXED_TIME = new Date("2026-01-15T10:00:00Z").getTime();
const THEMES = ["light", "dark"] as const;
const STATES = ["open", "hover", "focus", "mobile"] as const;

/**
 * Moves the frozen clock forward in steps. Between steps the page gets a
 * moment of real time, so work that real time drives (resize and
 * intersection observers, message channels) runs and its timers and
 * animation frames run in the next step. Then SVG animations are pinned.
 */
const settle = async (page: Page, milliseconds: number) => {
  for (let step = 0; step < 4; step++) {
    await page.clock.runFor(milliseconds / 4);
    await page.waitForTimeout(50);
  }
  await page.evaluate(() => {
    for (const svg of document.querySelectorAll("svg")) {
      svg.pauseAnimations();
      svg.setCurrentTime(2);
    }
  });
};

/**
 * Waits until no request has been open for 150 ms of real time, so lazily
 * loaded code and data have arrived before the clock moves.
 */
const networkQuiet = async (page: Page, pending: Set<unknown>) => {
  let quietSince = Date.now();
  while (Date.now() - quietSince < 150) {
    await page.waitForTimeout(25);
    if (pending.size > 0) quietSince = Date.now();
  }
};

const render = async (page: Page, id: string, theme: string) => {
  const pending = new Set<unknown>();
  page.on("request", (request) => pending.add(request));
  page.on("requestfailed", (request) => pending.delete(request));
  page.on("requestfinished", (request) => pending.delete(request));
  await page.addInitScript(() => {
    let seed = 1;
    Math.random = () => {
      seed = Math.trunc(seed + 0x6d_2b_79_f5);
      let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4_294_967_296;
    };
  });
  // Time stands still until settle() moves it, so every run sees the same frames.
  await page.clock.install({ time: FIXED_TIME });
  await page.clock.pauseAt(FIXED_TIME + 5000);
  await page.goto(
    `/iframe.html?id=${id}&viewMode=story&globals=theme:${theme}`,
  );
  await page.waitForFunction(
    () =>
      ["sb-show-main", "sb-show-errordisplay", "sb-show-nopreview"].some(
        (name) => document.body.classList.contains(name),
      ),
    undefined,
    { polling: 100 },
  );
  for (let round = 0; round < 2; round++) {
    await networkQuiet(page, pending);
    await page.evaluate(async () => document.fonts.ready);
    await settle(page, 1000);
  }
};

/**
 * Puts the story in one interaction state. When the story has nothing to act
 * on, the shot shows it as rendered, so a lost trigger still shows as a diff.
 */
const enter = async (page: Page, state: (typeof STATES)[number]) => {
  const root = page.locator("#storybook-root");
  // Tries each selector in turn, so a button wins over a focusable wrapper.
  const act = async (selectors: string[], action: "click" | "hover") => {
    for (const selector of selectors) {
      const target = root.locator(`${selector}:visible`).first();
      if ((await target.count()) === 0) continue;
      await target[action]({ timeout: 3000 }).catch(() => undefined);
      return;
    }
  };
  if (state === "open") {
    await act(["[aria-haspopup]", '[aria-expanded="false"]'], "click");
  } else if (state === "hover") {
    await act(["button", "a[href]", '[tabindex="0"]'], "hover");
  } else if (state === "focus") {
    await page.keyboard.press("Tab");
  } else {
    await page.setViewportSize({ height: 780, width: 390 });
  }
  await settle(page, 1000);
};

for (const entry of stories) {
  const states =
    deep.includes("all") || deep.includes(directoryOf(entry)) ? STATES : [];
  for (const theme of THEMES) {
    test(`${entry.id} ${theme}`, async ({ page }) => {
      await render(page, entry.id, theme);
      await expect(page).toHaveScreenshot(`${entry.id}--${theme}.png`);
    });
    for (const state of states) {
      test(`${entry.id} ${theme} ${state}`, async ({ page }) => {
        await render(page, entry.id, theme);
        await enter(page, state);
        await expect(page).toHaveScreenshot(
          `${entry.id}--${theme}--${state}.png`,
        );
      });
    }
  }
}
