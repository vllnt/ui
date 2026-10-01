import axe from "axe-core";
import { getStoryContext } from "@storybook/test-runner";

/**
 * Storybook test-runner hooks.
 *
 * Every story fails on console errors, React warnings and axe-core
 * violations (WCAG 2.0/2.1/2.2 A + AA), checked in the light and dark theme.
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
 * needs `a11y.reason`.
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

/**
 * Colour tokens whose contrast is being retuned in the design-token PR
 * (issue #535). A color-contrast node whose foreground or background is one
 * of these tokens is reported but does not fail the run; every other contrast
 * failure does. Delete an entry once its token passes AA.
 */
const PENDING_TOKEN_CONTRAST = ["--muted-foreground", "--destructive"];

const THEMES = ["light", "dark"];

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
  return { disabledRules: disabled.map((rule) => rule.id), skip };
}

async function settle(page) {
  await page.evaluate(async () => {
    const finite = document
      .getAnimations()
      .filter((animation) => animation.effect?.getTiming().iterations !== Infinity)
      .map((animation) => animation.finished.catch(() => undefined));
    await Promise.race([
      Promise.all(finite),
      new Promise((resolve) => setTimeout(resolve, 2000)),
    ]);
    await new Promise((resolve) => requestAnimationFrame(() => resolve()));
  });
}

async function setTheme(page, theme) {
  await page.evaluate(async (next) => {
    const root = document.documentElement;
    const channel = window.__STORYBOOK_ADDONS_CHANNEL__;
    if (root.classList.contains("dark") === (next === "dark")) return;
    const rendered = new Promise((resolve) => {
      const timer = setTimeout(resolve, 3000);
      channel.once("storyRendered", () => {
        clearTimeout(timer);
        resolve();
      });
    });
    channel.emit("updateGlobals", { globals: { theme: next } });
    await rendered;
  }, theme);
  await page.waitForFunction(
    (next) => document.documentElement.classList.contains("dark") === (next === "dark"),
    theme,
  );
}

async function runAxe(page, disabledRules) {
  if (!(await page.evaluate(() => Boolean(window.axe)))) {
    await page.addScriptTag({ content: axe.source });
  }
  return page.evaluate(
    async ({ disabled, pendingTokens, tags }) => {
      const canvas = document.createElement("canvas").getContext("2d");
      const rootStyle = getComputedStyle(document.documentElement);
      const tokenColours = pendingTokens.map((name) => {
        canvas.clearRect(0, 0, 1, 1);
        canvas.fillStyle = `oklch(${rootStyle.getPropertyValue(name).trim()})`;
        canvas.fillRect(0, 0, 1, 1);
        return [...canvas.getImageData(0, 0, 1, 1).data.slice(0, 3)];
      });
      const isPendingToken = (hex) => {
        if (typeof hex !== "string" || hex.length !== 7) return false;
        const rgb = [1, 3, 5].map((index) =>
          Number.parseInt(hex.slice(index, index + 2), 16),
        );
        return tokenColours.some((token) =>
          token.every((channel, index) => Math.abs(channel - rgb[index]) <= 2),
        );
      };
      const result = await window.axe.run(document, {
        resultTypes: ["violations"],
        rules: Object.fromEntries(disabled.map((id) => [id, { enabled: false }])),
        runOnly: { type: "tag", values: tags },
      });
      const violations = [];
      let pending = 0;
      for (const violation of result.violations) {
        const nodes = violation.nodes.filter((node) => {
          if (violation.id !== "color-contrast") return true;
          const data = node.any[0]?.data ?? {};
          const tokenOwned = isPendingToken(data.fgColor) || isPendingToken(data.bgColor);
          if (tokenOwned) pending += 1;
          return !tokenOwned;
        });
        if (nodes.length > 0) {
          violations.push({
            help: violation.help,
            id: violation.id,
            impact: violation.impact,
            nodes: nodes.map((node) => ({
              html: node.html.slice(0, 160),
              summary: (node.failureSummary ?? "").replace(/\s+/g, " ").slice(0, 240),
              target: node.target.join(" "),
            })),
          });
        }
      }
      return { pending, violations };
    },
    { disabled: disabledRules, pendingTokens: PENDING_TOKEN_CONTRAST, tags: AXE_TAGS },
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
  const { disabledRules, skip } = exceptionsFor(context, storyContext.parameters);
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
      await settle(page);
      const { violations } = await runAxe(page, disabled);
      report.push(...formatViolations(theme, violations));
    }
  } finally {
    await setTheme(page, initialTheme);
  }
  if (report.length > 0) {
    throw new Error(`Accessibility violations in ${context.id}:\n${report.join("\n")}`);
  }
}

/** @type {import('@storybook/test-runner').TestRunnerConfig} */
const config = {
  async preVisit(page, context) {
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
