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

The two most-violated rules in PR review history:

1. **Workspace gates green at HEAD** ([R6](./docs/agents/RULES.md#r6--workspace-gates-green-at-head)). Touched-file passes alone are not ship-OK. Run `pnpm -F @vllnt/ui lint && pnpm -F @vllnt/ui exec tsc --noEmit --project tsconfig.build.json && pnpm build && pnpm test:once` — all must be green.
2. **PR body matches HEAD** ([R3](./docs/agents/RULES.md#r3--pr-body-matches-head)). After every push, rewrite the body to match the current head. Stale claims block ship.
3. **Linked issue required** ([R5](./docs/agents/RULES.md#r5--linked-issue-required)). Every PR must reference a GitHub issue. Accepted keywords: `close` / `closes` / `closed`, `fix` / `fixes` / `fixed`, `resolve` / `resolves` / `resolved`, or repo phrases `Part of` / `Related to` — all case-insensitive, optional colon — followed by `#123` or `owner/repo#123`.

## Out of scope for agents

- Don't modify `LICENSE`, `CODE_OF_CONDUCT.md`, or `SECURITY.md` without explicit human authorization.
- Don't add new dependencies without explaining the tradeoff (bundle size, maintenance, security surface).
- Don't publish, push to `main`, or merge PRs without explicit authorization.
- Don't hand-edit generated files (`apps/registry/lib/component-metadata.json`, `dist/`). Regenerate via the documented script.
