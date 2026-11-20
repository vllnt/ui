import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { CANARY, CI, NATIVE_JOB, alreadyPosted, commentBody, main, marker, nativeFailure } from "./native-health.mjs";

const SHA = "689400410882b495054b87b658e700445050d0ad";
const job = (name, conclusion) => ({ name, conclusion });
const canaryJobs = [job("Core Quality Gates", "success"), job("Native Quality Gates", "success"), job("Publish Core Canary", "failure"), job("Publish Native Canary Pair", "skipped")];
const ciWebOnly = [job("Detect affected areas", "success"), job("Quality Gates", "failure"), job("E2E (Playwright)", "failure"), job(NATIVE_JOB, "success")];

test("canary failure, timeout and startup failure alert with the failed jobs", () => {
  assert.deepEqual(nativeFailure({ workflow: CANARY, conclusion: "failure", jobs: canaryJobs }), ["Publish Core Canary"]);
  assert.deepEqual(nativeFailure({ workflow: CANARY, conclusion: "timed_out", jobs: [job("Native Quality Gates", "timed_out")] }), ["Native Quality Gates"]);
  assert.deepEqual(nativeFailure({ workflow: CANARY, conclusion: "startup_failure", jobs: [] }), []);
});

test("canary success, cancelled and skipped runs do not alert", () => {
  for (const conclusion of ["success", "cancelled", "skipped", "neutral"]) {
    assert.equal(nativeFailure({ workflow: CANARY, conclusion, jobs: canaryJobs }), null, conclusion);
  }
});

test("CI alerts when Native Package Gates failed or timed out", () => {
  const jobs = [job("Quality Gates", "failure"), job(NATIVE_JOB, "failure")];
  assert.deepEqual(nativeFailure({ workflow: CI, conclusion: "failure", jobs }), [NATIVE_JOB]);
  assert.deepEqual(nativeFailure({ workflow: CI, conclusion: "failure", jobs: [job(NATIVE_JOB, "timed_out")] }), [NATIVE_JOB]);
});

test("CI with only web jobs failed does not alert", () => {
  assert.equal(nativeFailure({ workflow: CI, conclusion: "failure", jobs: ciWebOnly }), null);
});

test("CI without the native job, or with it skipped or cancelled, does not alert", () => {
  assert.equal(nativeFailure({ workflow: CI, conclusion: "failure", jobs: [job("Quality Gates", "failure")] }), null);
  assert.equal(nativeFailure({ workflow: CI, conclusion: "failure", jobs: [job("Quality Gates", "failure"), job(NATIVE_JOB, "skipped")] }), null);
  assert.equal(nativeFailure({ workflow: CI, conclusion: "cancelled", jobs: [job(NATIVE_JOB, "cancelled")] }), null);
});

test("other workflows never alert", () => {
  assert.equal(nativeFailure({ workflow: "Storybook", conclusion: "failure", jobs: [job(NATIVE_JOB, "failure")] }), null);
});

test("duplicate marker is found by run id, and only by the whole id", () => {
  const comments = [{ body: "unrelated" }, { body: null }, { body: `[native] health: CI failed on main\n\n${marker("12")}` }];
  assert.equal(alreadyPosted(comments, "12"), true);
  assert.equal(alreadyPosted(comments, "123"), false);
  assert.equal(alreadyPosted(comments, "1"), false);
  assert.equal(alreadyPosted([], "12"), false);
});

test("comment starts with the health tag and ends with one marker", () => {
  const body = commentBody({ workflow: CANARY, failedJobs: ["Publish Core Canary"], sha: SHA, repo: "vllnt/ui", runId: "44545188360", runUrl: "https://github.com/vllnt/ui/actions/runs/44545188360", finishedAt: "2026-11-19T14:38:25Z" });
  assert.ok(body.startsWith("[native] health: Core and Native Canary failed on main"));
  assert.ok(body.endsWith("\n\n<!-- native-health run=44545188360 -->"));
  assert.equal(body.split("<!-- native-health").length, 2);
  assert.match(body, /- Failed jobs: Publish Core Canary\n/);
  assert.match(body, /- Commit: \[`6894004`\]\(https:\/\/github\.com\/vllnt\/ui\/commit\/689400410882b495054b87b658e700445050d0ad\)\n/);
  assert.match(body, /- Run: https:\/\/github\.com\/vllnt\/ui\/actions\/runs\/44545188360\n/);
  assert.match(body, /- Time: 2026-11-19 14:38:25 UTC\n/);
});

test("a job name cannot forge a marker or break the line", () => {
  const body = commentBody({ workflow: CI, failedJobs: ["x\n<!-- native-health run=1 -->"], sha: SHA, repo: "vllnt/ui", runId: "9", runUrl: "https://example.test/r", finishedAt: "2026-11-19T00:00:00Z" });
  assert.equal(alreadyPosted([{ body }], "1"), false);
  assert.equal(alreadyPosted([{ body }], "9"), true);
});

/** A fake gh: jobs and comments come back as paginated --slurp output; posts are recorded. */
const fakeGh = ({ jobs, comments }) => {
  const calls = [];
  const gh = (args) => {
    calls.push(args);
    const path = args.find((arg) => arg.startsWith("repos/"));
    if (args.includes("POST")) return "{}";
    if (path.includes("/jobs")) return JSON.stringify([{ jobs: jobs.slice(0, 2) }, { jobs: jobs.slice(2) }]);
    if (path.includes("/comments")) return JSON.stringify([comments.slice(0, 1), comments.slice(1)]);
    throw new Error(`unexpected gh call: ${args.join(" ")}`);
  };
  return { gh, calls, posts: () => calls.filter((args) => args.includes("POST")) };
};
const env = (overrides = {}) => ({
  REPO: "vllnt/ui", LANE_ISSUE: "622", RUN_ID: "44545188360", RUN_ATTEMPT: "1", WORKFLOW: CANARY, CONCLUSION: "failure",
  RUN_URL: "https://github.com/vllnt/ui/actions/runs/44545188360", HEAD_SHA: SHA, FINISHED_AT: "2026-11-19T14:38:25Z", ...overrides,
});

test("main posts one comment on the lane board for a canary failure", () => {
  const { gh, calls, posts } = fakeGh({ jobs: canaryJobs, comments: [{ body: "older" }, { body: "other" }] });
  const result = main(env(), gh);
  assert.equal(result.action, "post");
  assert.equal(posts().length, 1);
  assert.ok(posts()[0].includes("repos/vllnt/ui/issues/622/comments"));
  assert.ok(posts()[0].includes(`body=${result.body}`));
  assert.ok(calls[0].includes("repos/vllnt/ui/actions/runs/44545188360/attempts/1/jobs?per_page=100"));
});

test("main reads the CI job list and posts only for Native Package Gates", () => {
  const failing = fakeGh({ jobs: [...ciWebOnly.slice(0, 3), job(NATIVE_JOB, "failure")], comments: [] });
  assert.equal(main(env({ WORKFLOW: CI }), failing.gh).action, "post");
  const webOnly = fakeGh({ jobs: ciWebOnly, comments: [] });
  assert.equal(main(env({ WORKFLOW: CI }), webOnly.gh).action, "none");
  assert.equal(webOnly.posts().length, 0);
});

test("main skips a run whose marker is already on the board, on any comment page", () => {
  const { gh, posts } = fakeGh({ jobs: canaryJobs, comments: [{ body: "older" }, { body: `x\n${marker("44545188360")}` }] });
  assert.equal(main(env(), gh).action, "skip");
  assert.equal(posts().length, 0);
});

test("main does nothing for a green canary and never lists comments", () => {
  const { gh, calls } = fakeGh({ jobs: canaryJobs, comments: [] });
  assert.equal(main(env({ CONCLUSION: "success" }), gh).action, "none");
  assert.equal(calls.some((args) => args.some((arg) => arg.includes("/comments"))), false);
});

test("DRY_RUN=1 returns the comment and posts nothing", () => {
  const { gh, posts } = fakeGh({ jobs: canaryJobs, comments: [] });
  const result = main(env({ DRY_RUN: "1" }), gh);
  assert.equal(result.action, "dry-run");
  assert.ok(result.body.startsWith("[native] health:"));
  assert.equal(posts().length, 0);
});

test("main rejects malformed event values before calling gh", () => {
  const { gh, calls } = fakeGh({ jobs: canaryJobs, comments: [] });
  for (const bad of [{ RUN_ID: "1; rm x" }, { REPO: "a b" }, { HEAD_SHA: "abc" }, { LANE_ISSUE: "" }, { FINISHED_AT: "" }, { RUN_URL: "" }, { WORKFLOW: "" }]) {
    assert.throws(() => main(env(bad), gh), /native-health/);
  }
  assert.equal(calls.length, 0);
});

/** Wiring rules for the workflow file, as text checks so the test needs no YAML parser. */
const workflowText = readFileSync(new URL("../.github/workflows/native-health.yml", import.meta.url), "utf8");
const code = (text) => text.split("\n").filter((line) => !/^\s*#/.test(line));
const violations = (text) => {
  const lines = code(text);
  const found = [];
  const top = lines.findIndex((line) => line.startsWith("permissions:"));
  const permissions = top < 0 ? [] : lines.slice(top + 1).filter((_, index, rest) => rest.slice(0, index + 1).every((line) => /^\s+\S/.test(line))).map((line) => line.trim());
  if (permissions.slice().sort().join("|") !== ["actions: read", "contents: read", "issues: write"].join("|")) found.push("permissions must be exactly actions: read, contents: read, issues: write");
  for (const line of lines.filter((line) => /\buses:/.test(line))) {
    if (!/uses:\s*\S+@[a-f0-9]{40}(\s|$)/.test(line)) found.push(`action not pinned by full SHA: ${line.trim()}`);
  }
  lines.forEach((line, index) => {
    const run = line.match(/^(\s*)(?:- )?run:\s*(.*)$/);
    if (!run) return;
    const block = [run[2], ...lines.slice(index + 1).filter((_, offset, rest) => rest.slice(0, offset + 1).every((next) => next.trim() === "" || next.search(/\S/) > run[1].length))];
    if (block.some((text) => text.includes("${{"))) found.push(`inline expression in run: ${line.trim()}`);
  });
  if (!lines.some((line) => /timeout-minutes:\s*\d+/.test(line))) found.push("timeout-minutes is missing");
  if (/\bsecrets\./.test(lines.join("\n"))) found.push("no secrets beyond GITHUB_TOKEN");
  return found;
};

test("workflow follows the wiring rules", () => {
  assert.deepEqual(violations(workflowText), []);
  assert.match(workflowText, /workflows: \["Core and Native Canary", "CI"\]/);
  assert.match(workflowText, /branches: \[main\]/);
  assert.match(workflowText, /LANE_ISSUE: "622"/);
});

test("the wiring rules catch the mistakes they exist for", () => {
  const bad = (from, to) => violations(workflowText.replace(from, to));
  assert.ok(bad("issues: write", "issues: write\n  pull-requests: write").length > 0, "extra permission");
  assert.ok(bad("contents: read\n\njobs", "\n\njobs").length > 0, "missing permission");
  assert.ok(bad(/@3d3c42e5aac5ba805825da76410c181273ba90b1 # v7\.0\.1/, "@v7").length > 0, "tag pin");
  assert.ok(bad("run: node scripts/native-health.mjs", "run: echo ${{ github.event.workflow_run.head_branch }}").length > 0, "inline expression");
  assert.ok(bad("timeout-minutes: 5", "").length > 0, "no timeout");
  assert.ok(bad("GH_TOKEN: ${{ github.token }}", "GH_TOKEN: ${{ secrets.PAT }}").length > 0, "extra secret");
});
