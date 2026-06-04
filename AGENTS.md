# Agent Instructions

Canonical instructions for AI coding agents working in this repository.
Harness-specific aliases (`CLAUDE.md`, `.cursorrules`, `codex.md`, etc.) reference this file.

This file is the **index**. Detailed rules live in [`docs/agents/`](./docs/agents/).

---

## Repository at a glance

- **Project:** `@vllnt/ui` — accessible React component library (Radix primitives + Tailwind + CVA).
- **Language:** TypeScript (strict mode via `@vllnt/typescript`).
- **Package manager:** pnpm. Lockfile: `pnpm-lock.yaml`. Never use `npm` / `yarn` / `bun`.
- **Monorepo tool:** Turborepo (`turbo.json`).
- **Primary branch:** `main`. Never commit directly to `main` — push branches, open PRs.

## Package map

| Path | Purpose | Published |
|------|---------|-----------|
| `packages/ui/` | `@vllnt/ui` component library | npm (public) |
| `apps/registry/` | `ui.vllnt.ai` — Next.js registry + docs site | deployed (Vercel) |
| `skills/` | Agent skills (e.g. `vllnt-ui` — how to consume `@vllnt/ui` + the design system) | — |
| `.github/workflows/` | CI: `ci.yml`, `publish.yml`, `storybook.yml`, `pr-issue-link.yml` | — |

External shared configs (separate npm packages): `@vllnt/eslint-config`, `@vllnt/typescript`.

## Commands (run from repo root)

| Command | Scope |
|---------|-------|
| `pnpm install --frozen-lockfile` | Install deps |
| `pnpm build` | Build every package |
| `pnpm lint` / `pnpm lint:fix` | Lint workspace |
| `pnpm test:once` | Vitest single-run workspace-wide |
| `pnpm -F @vllnt/ui test:visual` | Playwright CT visual snapshots |
| `pnpm -F @vllnt/ui test:coverage` | Vitest with coverage |
| `pnpm check:circular` | Fail on circular imports |
| `pnpm doctor` | react-doctor health scan (top rules) |
| `pnpm doctor:full` | Verbose full scan with per-file detail |
| `pnpm doctor:errors` | Scan, exit non-zero on any **error** (CI/pre-commit gate) |
| `pnpm doctor:staged` | Scan only staged files (what the pre-commit hook runs) |

---

## React health (react-doctor)

[react-doctor](https://github.com/millionco/react-doctor) scans React-specific
correctness, a11y, and dead-code health. Three surfaces, one shared gate
(**errors block, warnings are advisory**):

| Surface | Trigger | Gate |
|---------|---------|------|
| CI ([`.github/workflows/react-doctor.yml`](./.github/workflows/react-doctor.yml)) | PR (diff) + push to main (full report) | `--fail-on error` |
| Pre-commit ([`.githooks/pre-commit`](./.githooks/pre-commit)) | `git commit` with staged `.ts/.tsx` | `--fail-on error` on staged files |
| Local | `pnpm doctor*` scripts | per script |

The pre-commit hook is enabled automatically: the root `package.json` `prepare`
script points `core.hooksPath` at `.githooks/` on `pnpm install`. Bypass once
with `git commit --no-verify`.

### Config — [`doctor.config.json`](./doctor.config.json)

- `ignore.files` skips generated/build output so the score reflects hand-written
  source: `registry/default/**` (generated from `packages/ui/src` by
  `inline-component-source.ts`), `storybook-static`, `dist`, `.next`, Pagefind
  and shadcn registry output, and `*.visual.tsx` Playwright CT fixtures (test
  entry files the import graph can't see).
- Two rules are `off` because they conflict with deliberate library patterns:
  `no-multi-comp` (compound components such as `Alert`/`AlertTitle` co-located
  by design) and `only-export-components` (shadcn `cva` variants/types
  co-exported with the component).

---

## Agent rule index

Read these in order. Each is BLOCKING — violations keep a PR in draft.

| File | What |
|------|------|
| [`docs/agents/RULES.md`](./docs/agents/RULES.md) | The 15 BLOCKING rules — process + code quality. **Read first.** |
| [`docs/agents/PR_PLAYBOOK.md`](./docs/agents/PR_PLAYBOOK.md) | Ship checklist: diff sanity → gates → evidence → body refresh → ready |
| [`docs/agents/COMPONENTS.md`](./docs/agents/COMPONENTS.md) | Component patterns: forwardRef, semantic root, ARIA, events, props |
| [`docs/agents/BRANCHING.md`](./docs/agents/BRANCHING.md) | Branch hygiene: zero-diff, supersede, reconcile, worktrees |

Repository-wide docs (audience = contributors, not just agents):

| File | What |
|------|------|
| [`README.md`](./README.md) | Public README + component catalog |
| [`CONTRIBUTING.md`](./CONTRIBUTING.md) | Contributor onramp |
| [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md) | Monorepo layout, build graph, theming |
| [`docs/RELEASING.md`](./docs/RELEASING.md) | Release + canary flow |
| [`SECURITY.md`](./SECURITY.md) | Security policy (don't modify without authorization) |

---

## Quick reference

The most-violated rules in PR review history:

0. **Design rules are mandatory for UI work.** Any UI suggestion or component/site change must follow [`DESIGN.md`](./DESIGN.md) and the machine-readable tokens in [`packages/design/tokens.json`](./packages/design/tokens.json). List any intentional deviation in the PR body.
1. **Workspace gates green at HEAD** ([R6](./docs/agents/RULES.md#r6--workspace-gates-green-at-head)). Touched-file passes alone are not ship-OK. Run `pnpm -F @vllnt/ui lint && pnpm -F @vllnt/ui exec tsc --noEmit --project tsconfig.build.json && pnpm build && pnpm test:once` — all must be green.
2. **PR body matches HEAD** ([R3](./docs/agents/RULES.md#r3--pr-body-matches-head)). After every push, rewrite the body to match the current head. Stale claims block ship.
3. **Linked issue required** ([R5](./docs/agents/RULES.md#r5--linked-issue-required)). Every PR must reference a GitHub issue. Accepted keywords: `close` / `closes` / `closed`, `fix` / `fixes` / `fixed`, `resolve` / `resolves` / `resolved`, or repo phrases `Part of` / `Related to` — all case-insensitive, optional colon — followed by `#123` or `owner/repo#123`.

## Out of scope for agents

- Don't modify `LICENSE`, `CODE_OF_CONDUCT.md`, or `SECURITY.md` without explicit human authorization.
- Don't add new dependencies without explaining the tradeoff (bundle size, maintenance, security surface).
- Don't publish, push to `main`, or merge PRs without explicit authorization.
- Don't hand-edit generated files (`apps/registry/lib/component-metadata.json`, `dist/`). Regenerate via the documented script.
