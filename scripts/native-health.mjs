// Native lane health alert. Runs from .github/workflows/native-health.yml after a main run of
// "Core and Native Canary" or "CI" completes, and comments once on the lane board when native failed.
// The decision and the comment text are pure functions so scripts/native-health.test.mjs can cover them.
import { execFileSync } from "node:child_process";
import { pathToFileURL } from "node:url";

export const CANARY = "Core and Native Canary";
export const CI = "CI";
/** Matched by name, not job id: ci.yml may be split, this name stays. */
export const NATIVE_JOB = "Native Package Gates";
const FAILED_RUN = new Set(["failure", "timed_out", "startup_failure"]);
const FAILED_JOB = new Set(["failure", "timed_out"]);

/**
 * Names of the failed native jobs when this finished run needs an alert, otherwise null.
 * Canary: the run itself failed (a startup failure has no jobs, so the list may be empty).
 * CI: only the "Native Package Gates" job counts; a missing or skipped job means native is not affected.
 */
export function nativeFailure({ workflow, conclusion, jobs }) {
  const failed = jobs.filter((job) => FAILED_JOB.has(job.conclusion)).map((job) => job.name);
  if (workflow === CANARY) return FAILED_RUN.has(conclusion) ? failed : null;
  if (workflow === CI) return failed.includes(NATIVE_JOB) ? [NATIVE_JOB] : null;
  return null;
}

/** Hidden marker closing the comment; the closing ` -->` keeps run=12 from matching run=123. */
export const marker = (runId) => `<!-- native-health run=${runId} -->`;

export const alreadyPosted = (comments, runId) => comments.some((comment) => (comment.body ?? "").includes(marker(runId)));

/** One line, no tags: names come from workflow files, but the marker must never be forgeable. */
const clean = (text) => String(text).replace(/\s+/g, " ").replace(/[<>]/g, "").trim();

export function commentBody({ workflow, failedJobs, sha, repo, runId, runUrl, finishedAt }) {
  const time = new Date(finishedAt).toISOString().slice(0, 19).replace("T", " ");
  return [
    `[native] health: ${clean(workflow)} failed on main`,
    "",
    `- Workflow: ${clean(workflow)}`,
    `- Failed jobs: ${failedJobs.length > 0 ? failedJobs.map(clean).join(", ") : "none reported"}`,
    `- Commit: [\`${sha.slice(0, 7)}\`](https://github.com/${repo}/commit/${sha})`,
    `- Run: ${runUrl}`,
    `- Time: ${time} UTC`,
    "",
    marker(runId),
  ].join("\n");
}

const expect = (name, value, pattern) => {
  if (!pattern.test(value ?? "")) throw new Error(`native-health: ${name} is missing or malformed`);
  return value;
};

/**
 * Reads the finished run, decides, and posts at most one comment.
 * `gh` runs the GitHub CLI with an argument list and returns stdout; `env.DRY_RUN=1` never posts.
 * Returns { action: "none" | "skip" | "post" | "dry-run", body? }.
 */
export function main(env, gh) {
  const repo = expect("REPO", env.REPO, /^[\w.-]+\/[\w.-]+$/);
  const runId = expect("RUN_ID", env.RUN_ID, /^\d+$/);
  const attempt = expect("RUN_ATTEMPT", env.RUN_ATTEMPT ?? "1", /^\d+$/);
  const issue = expect("LANE_ISSUE", env.LANE_ISSUE, /^\d+$/);
  const sha = expect("HEAD_SHA", env.HEAD_SHA, /^[a-f0-9]{40}$/);
  const workflow = expect("WORKFLOW", env.WORKFLOW, /\S/); // empty must fail loudly, not read as "not native"
  const runUrl = expect("RUN_URL", env.RUN_URL, /^https:\/\//);
  const finishedAt = expect("FINISHED_AT", env.FINISHED_AT, /^\d{4}-\d\d-\d\dT/);

  const jobPages = JSON.parse(gh(["api", "--paginate", "--slurp", `repos/${repo}/actions/runs/${runId}/attempts/${attempt}/jobs?per_page=100`]));
  const failedJobs = nativeFailure({ workflow, conclusion: env.CONCLUSION, jobs: jobPages.flatMap((page) => page.jobs) });
  if (failedJobs === null) return { action: "none" };

  const commentPages = JSON.parse(gh(["api", "--paginate", "--slurp", `repos/${repo}/issues/${issue}/comments?per_page=100`]));
  if (alreadyPosted(commentPages.flat(), runId)) return { action: "skip" };

  const body = commentBody({ workflow, failedJobs, sha, repo, runId, runUrl, finishedAt });
  if (env.DRY_RUN === "1") return { action: "dry-run", body };
  gh(["api", "--method", "POST", `repos/${repo}/issues/${issue}/comments`, "-f", `body=${body}`]);
  return { action: "post", body };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const gh = (args) => execFileSync("gh", args, { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
  const { action, body } = main(process.env, gh);
  console.log(`native-health: ${action} (${process.env.WORKFLOW}, run ${process.env.RUN_ID})`);
  if (action === "dry-run") console.log(`\n${body}`);
}
