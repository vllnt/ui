/**
 * Registry drift check.
 *
 * Run AFTER `pnpm registry:build` (CI runs it via `pnpm build`). The generated
 * registry artifacts — the shadcn shims under registry/default, registry.json,
 * and component-metadata.json — are derived from the canonical component sources
 * in packages/ui. If a source changes (e.g. the PR #404 OKLCH migration) but the
 * artifacts are not regenerated and committed, shadcn-installed components ship
 * stale code (the blocker that rendered components black under OKLCH tokens).
 *
 * This fails the build when the freshly-built artifacts differ from what is
 * committed, ignoring only the non-deterministic `generatedAt` timestamp.
 *
 * Usage: pnpm -F @vllnt/ui-registry registry:check  (build first)
 */

import { execSync } from "node:child_process";

const TRACKED_PATHS = [
  "apps/registry/registry.json",
  "apps/registry/registry/default",
  "apps/registry/lib/component-metadata.json",
];

const repoRoot = execSync("git rev-parse --show-toplevel", {
  encoding: "utf8",
}).trim();

const diff = execSync(`git diff -- ${TRACKED_PATHS.join(" ")}`, {
  cwd: repoRoot,
  encoding: "utf8",
  maxBuffer: 64 * 1024 * 1024,
});

const meaningful = diff
  .split("\n")
  .filter((line) => {
    if (!line.startsWith("+") && !line.startsWith("-")) return false;
    if (line.startsWith("+++") || line.startsWith("---")) return false;
    return !line.includes("generatedAt");
  })
  .join("\n");

if (meaningful.trim().length > 0) {
  console.error(
    "Registry artifacts are out of sync with the canonical component sources.\n" +
      "Run `pnpm -F @vllnt/ui-registry registry:build` and commit the result.\n\n" +
      diff,
  );
  process.exit(1);
}

console.log("Registry artifacts are in sync with canonical sources.");
