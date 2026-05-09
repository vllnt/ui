# Branch Hygiene

How to avoid orphaned branches and supersede churn.

---

## Rules

### B1 — Zero-diff branches close, not ready

Before `gh pr ready`:

```bash
git diff --stat origin/main...HEAD
```

Empty → the branch is stale or its work already landed somewhere else. Close the PR with a 1-line comment pointing at what superseded it.

> **Counters:** PR #121 (`feat: restore storybook integration base`) was closed: *"This PR is a zero-file diff against main, so there is nothing left to review or merge."*

### B2 — Supersede explicitly

When you re-cut a branch (rebase landed elsewhere, base changed, branch got orphaned), close the older PR and link the canonical one:

> Superseded by #N after the original head branch was orphaned. Use #N for final review.

Don't leave parallel ghost branches racing.

> **Counters:** Pairs #138/#143, #142/#123, #146/#145.

### B3 — Reconcile before requesting review

If your branch falls behind `main`, rebase or merge `main` into the branch **before** asking for review. Resolve generated-file conflicts (`apps/registry/lib/component-metadata.json`) by regenerating — never hand-edit.

```bash
git fetch origin
git rebase origin/main          # or: git merge origin/main
pnpm -F @vllnt/ui-registry sync-storybook
pnpm -F @vllnt/ui-registry registry:build
git add -p
```

### B4 — Worktrees for parallel work

Default to git worktrees when starting a second feature, taking a hotfix, or reviewing a PR. Don't pile parallel work onto `main`.

```bash
git worktree add -b feat/my-feature .worktrees/my-feature main
```

---

## Branch naming

| Prefix | When |
|--------|------|
| `feat/` | New component, API, or behavior |
| `fix/`  | Bug fix |
| `chore/` | Tooling, deps, repo housekeeping |
| `docs/` | Documentation only |
| `ci/`   | CI / workflow changes |
| `refactor/` | No behavior change |

Match the prefix to the conventional commit type. Release notes are grouped from these.
