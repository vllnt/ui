/**
 * Visual diff: screenshots every story of two Storybook builds on this
 * machine and lists each shot whose pixels changed. The base build (usually
 * `main`) is captured first as the reference, then the head build is
 * compared with it pixel by pixel (`stories.spec.ts`). Both captures run on
 * the same machine and browser, so no baseline images are committed.
 *
 * Compare two builds:
 *   node scripts/visual-diff/run.mjs --base <storybook-static> --head <storybook-static>
 *     [--out .visual-diff] [--workers 2] [--shard 1/4] [--deep <dir,dir|all>]
 * Writes <out>/summary.md, <out>/summary.json and a Playwright HTML report in
 * <out>/html with the before, after and diff image of every changed shot.
 *
 * Merge the summaries of several shards (CI):
 *   node scripts/visual-diff/run.mjs --merge <out> [<out> ...]
 *
 * Exit code: 0 when no shot changed, 1 when a shot changed, disappeared or
 * failed to render, 2 on a usage or capture error.
 */

import { spawnSync } from "node:child_process";
import {
  appendFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
} from "node:fs";
import { createRequire } from "node:module";
import { dirname, join, resolve } from "node:path";
import { parseArgs } from "node:util";

const { positionals, values } = parseArgs({
  allowPositionals: true,
  options: {
    base: { type: "string" },
    deep: { default: "", type: "string" },
    head: { type: "string" },
    merge: { type: "boolean" },
    out: { default: ".visual-diff", type: "string" },
    shard: { default: "1/1", type: "string" },
    workers: { default: "2", type: "string" },
  },
});

const fail = (message) => {
  console.error(message);
  process.exit(2);
};

const plain = (text) => text.replaceAll(/\u001B\[\d+m/g, "");

/** Runs one capture pass and returns its Playwright JSON report. */
function capture(out, storybook, name, update) {
  const report = join(out, `${name}.json`);
  const cli = join(
    dirname(createRequire(import.meta.url).resolve("playwright/package.json")),
    "cli.js",
  );
  const config = join(import.meta.dirname, "playwright.config.ts");
  const result = spawnSync(
    process.execPath,
    [cli, "test", "-c", config, `--update-snapshots=${update}`],
    {
      env: {
        ...process.env,
        VISUAL_DIFF_DEEP: values.deep,
        VISUAL_DIFF_HTML: join(out, name === "head" ? "html" : `${name}-html`),
        VISUAL_DIFF_OUTPUT: join(out, `${name}-results`),
        VISUAL_DIFF_REPORT: report,
        VISUAL_DIFF_SHARD: values.shard,
        VISUAL_DIFF_SNAPSHOTS: join(out, "snapshots"),
        VISUAL_DIFF_STORYBOOK: resolve(storybook),
        VISUAL_DIFF_WORKERS: values.workers,
      },
      stdio: "inherit",
    },
  );
  if (!existsSync(report)) {
    fail(`The ${name} capture wrote no report (exit ${result.status}).`);
  }
  return JSON.parse(readFileSync(report, "utf8"));
}

/** Flattens a Playwright JSON report into { title, status, message }. */
function shots(report) {
  const found = [];
  const walk = (suite) => {
    for (const spec of suite.specs ?? []) {
      const result = spec.tests[0]?.results.at(-1);
      found.push({
        message: plain(result?.error?.message ?? ""),
        status: result?.status ?? "skipped",
        title: spec.title,
      });
    }
    for (const child of suite.suites ?? []) walk(child);
  };
  for (const suite of report.suites) walk(suite);
  return found;
}

/** Sorts every head shot into same, changed, new or failed, against base. */
function compare(baseShots, headShots) {
  const base = new Map(baseShots.map((shot) => [shot.title, shot]));
  const summary = { changed: [], errors: [], new: [], removed: [], same: 0 };
  for (const shot of headShots) {
    const before = base.get(shot.title);
    const firstLine = (text) => text.split("\n")[0] ?? "";
    if (shot.status === "passed") {
      summary.same += 1;
    } else if (before && before.status !== "passed") {
      summary.errors.push({
        reason: `base: ${firstLine(before.message)}`,
        title: shot.title,
      });
    } else if (shot.message.includes("snapshot doesn't exist")) {
      summary.new.push({ title: shot.title });
    } else if (/pixels \(ratio|Expected an image/.test(shot.message)) {
      const pixels = /(\d+) pixels \(ratio/.exec(shot.message)?.[1];
      summary.changed.push({
        detail: pixels
          ? `${pixels} px`
          : (/Expected an image[^\n]*/.exec(shot.message)?.[0] ?? "size"),
        title: shot.title,
      });
    } else {
      summary.errors.push({
        reason: firstLine(shot.message) || shot.status,
        title: shot.title,
      });
    }
  }
  const headTitles = new Set(headShots.map((shot) => shot.title));
  for (const title of base.keys()) {
    if (!headTitles.has(title)) summary.removed.push({ title });
  }
  return summary;
}

const failingCount = (summary) =>
  summary.changed.length + summary.removed.length + summary.errors.length;

function toMarkdown(summary) {
  const section = (heading, rows, cell) =>
    rows.length === 0
      ? ""
      : `\n### ${heading} (${rows.length})\n\n| Shot | |\n| --- | --- |\n${rows
          .map((row) => `| \`${row.title}\` | ${cell(row)} |`)
          .join("\n")}\n`;
  const failing = failingCount(summary);
  const headline =
    failing === 0
      ? "No visual change: every shot is pixel-identical to the base build."
      : `**${failing} shot(s) differ from the base build.** The \`visual-diff-*\` artifacts hold a Playwright report (html/index.html) with the before, after and diff image of each.`;
  return [
    `## Visual diff\n\n${headline}\n`,
    "| Same | Changed | New | Removed | Failed to render |",
    "| --- | --- | --- | --- | --- |",
    `| ${summary.same} | ${summary.changed.length} | ${summary.new.length} | ${summary.removed.length} | ${summary.errors.length} |\n`,
    section("Changed", summary.changed, (row) => row.detail),
    section("Removed", summary.removed, () => "story gone in head"),
    section("Failed to render", summary.errors, (row) =>
      row.reason.replaceAll("|", String.raw`\|`),
    ),
    section("New", summary.new, () => "no base shot"),
  ].join("\n");
}

function report(summary, out) {
  const markdown = toMarkdown(summary);
  if (out) {
    writeFileSync(
      join(out, "summary.json"),
      `${JSON.stringify(summary, undefined, 2)}\n`,
    );
    writeFileSync(join(out, "summary.md"), markdown);
  }
  if (process.env.GITHUB_STEP_SUMMARY) {
    appendFileSync(process.env.GITHUB_STEP_SUMMARY, markdown);
  }
  console.log(`\n${markdown}`);
  process.exit(failingCount(summary) === 0 ? 0 : 1);
}

if (values.merge) {
  if (positionals.length === 0) fail("Usage: run.mjs --merge <out> [<out> ...]");
  const merged = { changed: [], errors: [], new: [], removed: [], same: 0 };
  for (const directory of positionals) {
    const file = join(directory, "summary.json");
    if (!existsSync(file)) fail(`${file} not found: a shard did not finish.`);
    const part = JSON.parse(readFileSync(file, "utf8"));
    merged.same += part.same;
    for (const key of ["changed", "errors", "new", "removed"]) {
      merged[key].push(...part[key]);
    }
  }
  report(merged);
}

if (!values.base || !values.head) {
  fail("Usage: run.mjs --base <storybook-static> --head <storybook-static>");
}
for (const directory of [values.base, values.head]) {
  if (!existsSync(join(directory, "index.json"))) {
    fail(`${directory}/index.json not found: build Storybook first.`);
  }
}
const out = resolve(values.out);
mkdirSync(out, { recursive: true });
const baseShots = shots(capture(out, values.base, "base", "all"));
const headShots = shots(capture(out, values.head, "head", "none"));
report(compare(baseShots, headShots), out);
