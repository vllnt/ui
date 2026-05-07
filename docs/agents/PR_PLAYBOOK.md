# PR Playbook

The canonical ship checklist. Mirrors the BLOCKING rules in [`RULES.md`](./RULES.md) but ordered as a runbook.

If any step fails, the PR stays in draft until fixed.

---

## 0. Branch + issue link

- Branch name follows `feat/`, `fix/`, `chore/`, `docs/`, `ci/`, `refactor/`.
- Reference an issue in the PR body: `Closes #N`, `Fixes #N`, or `Related to #N`. CI gate: `.github/workflows/pr-issue-link.yml`.

## 1. Diff sanity (R2)

```bash
git diff --stat origin/main...HEAD
```

Zero diff → close the branch. Don't ship a no-op.

## 2. Targeted gates (after each edit batch)

```bash
pnpm -F @vllnt/ui exec eslint <changed files>
pnpm -F @vllnt/ui exec tsc --noEmit --project tsconfig.build.json
```

## 3. Workspace gates (R6 — before requesting merge)

All four must be green at HEAD:

```bash
pnpm -F @vllnt/ui lint
pnpm -F @vllnt/ui exec tsc --noEmit --project tsconfig.build.json
pnpm build
pnpm test:once
```

Touched-file passes alone are **not** ship-OK. If `tsc` is red package-wide, the PR is red package-wide.

## 4. UI evidence (R4)

For UI behavior changes:

```bash
pnpm -F @vllnt/ui test:visual
```

Plus, paste in the PR body **one of**:

- The exact verification command + its output, or
- A screenshot / recording from the current head.

Bare ticked checkboxes don't count.

## 5. Story coverage

```bash
pnpm -F @vllnt/ui exec tsx scripts/check-story-coverage.ts
pnpm -F @vllnt/ui exec tsx scripts/verify-stories.ts
```

These also run in CI (`storybook.yml`). Run them locally first.

## 6. Refresh PR body to match HEAD (R3)

After your final push, **rewrite** the PR body so it matches the current head:

- Validation commands actually run on this commit.
- Screenshots / recordings from this commit.
- CI status as-of-now.
- Listed components match the actual diff.

Stale claims block ship.

## 7. CHANGELOG (user-facing changes)

If the change is user-facing, add an entry under `[Unreleased]` in `packages/ui/CHANGELOG.md`. Group as `Added` / `Changed` / `Fixed` / `Deprecated` / `Removed`.

## 8. Mark ready

Only after steps 1–7 pass:

```bash
gh pr ready
```

## 9. Post-PR monitoring

Watch CI through to green. If a check fails:

- Diagnose the root cause (don't bypass with `--no-verify` or `eslint-disable`).
- Push a fix commit on the same branch.
- Re-run [step 6](#6-refresh-pr-body-to-match-head-r3).

## 10. Codex review (optional)

If Codex CLI is available + `OPENAI_API_KEY` is set, run it and include findings.

If not available, **omit the section entirely**. Don't paste *"Codex unavailable"* boilerplate. (R7)

---

## Anti-patterns

- ❌ "Targeted lint/tests passed; package-wide is red on pre-existing issues" → fix or escalate, don't normalize.
- ❌ Marking ready with stale PR body claims.
- ❌ Marking ready with zero diff vs `main`.
- ❌ Empty `## Manual verification` section.
- ❌ Skipping visual regression for "just a style tweak."
- ❌ Suppressing lint/typecheck errors instead of fixing the source.
