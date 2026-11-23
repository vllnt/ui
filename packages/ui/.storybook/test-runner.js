import axe from "axe-core";
import { getStoryContext } from "@storybook/test-runner";

/**
 * Storybook test-runner hooks.
 *
 * Every story fails on console errors, React warnings and axe-core
 * violations (WCAG 2.0/2.1/2.2 A + AA), checked in the light and dark theme,
 * each with the glass and the solid material (`html[data-glass="off"]`).
 *
 * Stories render with `prefers-reduced-motion: reduce`. Under it a story may
 * not run an endless animation (WCAG 2.2.2, 2.3.3) except a loader marked
 * `data-motion="essential"`, and every element reached
 * with Tab must look different when focused (WCAG 2.4.7).
 *
 * A story that needs an accessibility exception declares it where it lives,
 * with a reason the runner requires:
 *
 *   parameters: {
 *     a11y: {
 *       config: {
 *         rules: [{ id: "color-contrast", enabled: false, reason: "…" }],
 *       },
 *     },
 *   }
 *
 * `a11y.test: "off"` (or `a11y.disable: true`) skips axe for a story and also
 * needs `a11y.reason`. `a11y.motion: { reason }` allows an endless animation
 * under reduced motion and `a11y.focus: { reason }` skips the focus check.
 */

const pageConsoleErrors = new Map();
const pageConsoleWarnings = new Map();

const AXE_TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];

/** Page-scaffold rules: a story canvas is a fragment, not a document. */
const PAGE_LEVEL_RULES = [
  "bypass",
  "document-title",
  "html-has-lang",
  "landmark-one-main",
  "page-has-heading-one",
  "region",
];

const THEMES = ["light", "dark"];
const MATERIALS = ["glass", "solid"];
/** Most Tab stops visited per story by the focus check. */
const MAX_TAB_STOPS = 12;

function exceptionsFor(context, parameters) {
  const a11y = parameters?.a11y ?? {};
  const skip = a11y.disable === true || a11y.test === "off";
  if (skip && !a11y.reason) {
    throw new Error(
      `${context.id}: parameters.a11y disables axe without an a11y.reason`,
    );
  }
  const disabled = (a11y.config?.rules ?? []).filter(
    (rule) => rule.enabled === false,
  );
  const unexplained = disabled.filter((rule) => !rule.reason);
  if (unexplained.length > 0) {
    throw new Error(
      `${context.id}: a11y.config.rules disables ${unexplained
        .map((rule) => rule.id)
        .join(", ")} without a reason`,
    );
  }
  for (const key of ["motion", "focus"]) {
    if (a11y[key] !== undefined && !a11y[key]?.reason) {
      throw new Error(`${context.id}: parameters.a11y.${key} needs a reason`);
    }
  }
  return {
    allowFocus: Boolean(a11y.focus),
    allowMotion: Boolean(a11y.motion),
    disabledRules: disabled.map((rule) => rule.id),
    skip,
  };
}

/** Waits (at most 1s) for finite animations so axe sees settled colours. */
async function settle(page) {
  await page.evaluate(async () => {
    const finite = document
      .getAnimations()
      .filter((animation) => animation.effect?.getTiming().iterations !== Infinity)
      .map((animation) => animation.finished.catch(() => undefined));
    await Promise.race([
      Promise.all(finite),
      new Promise((resolve) => setTimeout(resolve, 1000)),
    ]);
    await new Promise((resolve) => requestAnimationFrame(() => resolve()));
  });
}

/** Switches the addon-themes global and waits for the class on <html>. */
async function setTheme(page, theme) {
  const isDark = theme === "dark";
  const current = await page.evaluate(() =>
    document.documentElement.classList.contains("dark"),
  );
  if (current === isDark) return;
  await page.evaluate((next) => {
    window.__STORYBOOK_ADDONS_CHANNEL__.emit("updateGlobals", {
      globals: { theme: next },
    });
  }, theme);
  await page.waitForFunction(
    (dark) => document.documentElement.classList.contains("dark") === dark,
    isDark,
    { timeout: 5000 },
  );
  await page.evaluate(
    () =>
      new Promise((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
      ),
  );
}

/** Turns the glass material off (solid) or back on, as apps do with `data-glass`. */
async function setMaterial(page, material) {
  await page.evaluate((next) => {
    if (next === "solid") document.documentElement.dataset.glass = "off";
    else delete document.documentElement.dataset.glass;
  }, material);
  await page.evaluate(
    () => new Promise((resolve) => requestAnimationFrame(() => resolve())),
  );
}

/**
 * Endless animations a story would run under `prefers-reduced-motion: reduce`.
 * In test mode Storybook adds a style that pauses every animation; it is
 * switched off while the story's own CSS decides (`animation-play-state`).
 */
async function endlessAnimations(page) {
  return page.evaluate(() => {
    const pauseSheets = [...document.querySelectorAll("style")]
      .filter((node) =>
        /animation-play-state:\s*paused\s*!important/.test(node.textContent ?? ""),
      )
      .map((node) => node.sheet)
      .filter((sheet) => sheet && !sheet.disabled);
    for (const sheet of pauseSheets) sheet.disabled = true;
    try {
      return document
        .getAnimations()
        .filter((animation) => {
          if (animation.effect?.getTiming().iterations !== Infinity) return false;
          const target = animation.effect?.target;
          if (!(target instanceof Element)) return animation.playState === "running";
          if (target.closest('[data-motion="essential"]')) return false;
          return (
            getComputedStyle(target).animationPlayState.split(",")[0].trim() ===
            "running"
          );
        })
        .map((animation) => {
          const target = animation.effect?.target;
          const name = animation.animationName ?? animation.id ?? "animation";
          const where =
            target instanceof Element
              ? target.outerHTML.slice(0, 120)
              : "unknown target";
          return `${name} on ${where}`;
        });
    } finally {
      for (const sheet of pauseSheets) sheet.disabled = false;
    }
  });
}

/**
 * Tabs through the story and returns the stops whose look does not change
 * between focused and blurred (no outline, ring, border or fill change).
 */
async function invisibleFocusStops(page) {
  const missing = [];
  const seen = new Set();
  await page.evaluate(() => {
    if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
  });
  for (let index = 0; index < MAX_TAB_STOPS; index += 1) {
    await page.keyboard.press("Tab");
    const stop = await page.evaluate(() => {
      const element = document.activeElement;
      const root = document.querySelector("#storybook-root");
      if (!(element instanceof HTMLElement) || !root?.contains(element)) {
        return null;
      }
      const snapshot = () => {
        const parts = [];
        for (const node of [element, element.parentElement]) {
          if (!node) continue;
          const style = getComputedStyle(node);
          parts.push(
            style.outlineStyle === "none" ? "none" : `${style.outlineStyle} ${style.outlineWidth} ${style.outlineColor}`,
            style.boxShadow,
            style.borderColor,
            style.backgroundColor,
            style.color,
            style.textDecorationLine,
          );
        }
        return parts.join("|");
      };
      const focused = snapshot();
      const key = element.outerHTML.slice(0, 160);
      element.blur();
      const blurred = snapshot();
      element.focus({ focusVisible: true, preventScroll: true });
      return { key, visible: focused !== blurred };
    });
    if (!stop || seen.has(stop.key)) break;
    seen.add(stop.key);
    if (!stop.visible) missing.push(stop.key);
  }
  return missing;
}

async function runAxe(page, disabledRules) {
  if (!(await page.evaluate(() => Boolean(window.axe)))) {
    await page.addScriptTag({ content: axe.source });
  }
  return page.evaluate(
    async ({ disabled, tags }) => {
      const result = await window.axe.run(document, {
        resultTypes: ["violations"],
        rules: Object.fromEntries(disabled.map((id) => [id, { enabled: false }])),
        runOnly: { type: "tag", values: tags },
      });
      return result.violations.map((violation) => ({
        help: violation.help,
        id: violation.id,
        impact: violation.impact,
        nodes: violation.nodes.map((node) => ({
          html: node.html.slice(0, 160),
          summary: (node.failureSummary ?? "").replace(/\s+/g, " ").slice(0, 240),
          target: node.target.join(" "),
        })),
      }));
    },
    { disabled: disabledRules, tags: AXE_TAGS },
  );
}

function formatViolations(theme, violations) {
  return violations.flatMap((violation) => [
    `  [${theme}] ${violation.id} (${violation.impact}): ${violation.help}`,
    ...violation.nodes
      .slice(0, 5)
      .map((node) => `    ${node.target} — ${node.summary || node.html}`),
  ]);
}

async function checkA11y(page, context) {
  const storyContext = await getStoryContext(page, context);
  const { allowFocus, allowMotion, disabledRules, skip } = exceptionsFor(
    context,
    storyContext.parameters,
  );
  if (skip) return;
  const disabled = [...PAGE_LEVEL_RULES, ...disabledRules];
  const initialTheme = (await page.evaluate(() =>
    document.documentElement.classList.contains("dark"),
  ))
    ? "dark"
    : "light";
  const report = [];
  try {
    for (const theme of THEMES) {
      await setTheme(page, theme);
      for (const material of MATERIALS) {
        await setMaterial(page, material);
        await settle(page);
        const violations = await runAxe(page, disabled);
        report.push(...formatViolations(`${theme} ${material}`, violations));
      }
    }
  } finally {
    await setMaterial(page, "glass");
    await setTheme(page, initialTheme);
  }
  if (!allowMotion) {
    const endless = await endlessAnimations(page);
    report.push(
      ...endless.map(
        (entry) => `  [reduced motion] endless animation still runs: ${entry}`,
      ),
    );
  }
  if (!allowFocus) {
    const invisible = await invisibleFocusStops(page);
    report.push(
      ...invisible.map(
        (entry) => `  [focus visible] no visible focus change on ${entry}`,
      ),
    );
  }
  if (report.length > 0) {
    throw new Error(`Accessibility violations in ${context.id}:\n${report.join("\n")}`);
  }
}

/** @type {import('@storybook/test-runner').TestRunnerConfig} */
const config = {
  async preVisit(page, context) {
    await page.emulateMedia({ reducedMotion: "reduce" });
    const errors = [];
    const warnings = [];
    pageConsoleErrors.set(context.id, errors);
    pageConsoleWarnings.set(context.id, warnings);
    page.on("console", (msg) => {
      if (msg.type() === "error") {
        errors.push(msg.text());
      }
      if (msg.type() === "warning") {
        const text = msg.text();
        if (
          text.includes("Warning:") ||
          text.includes("Each child in a list") ||
          text.includes("validateDOMNesting") ||
          text.includes("aria-") ||
          text.includes("Unknown prop")
        ) {
          warnings.push(text);
        }
      }
    });
  },
  async postVisit(page, context) {
    const errors = pageConsoleErrors.get(context.id) ?? [];
    const warnings = pageConsoleWarnings.get(context.id) ?? [];
    pageConsoleErrors.delete(context.id);
    pageConsoleWarnings.delete(context.id);

    if (errors.length > 0) {
      throw new Error(
        `Console errors in ${context.id}:\n${errors.join("\n")}`,
      );
    }

    if (warnings.length > 0) {
      throw new Error(
        `React warnings in ${context.id}:\n${warnings.join("\n")}`,
      );
    }

    await checkA11y(page, context);
  },
};

export default config;
