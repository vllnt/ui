# Rules for AI Coding Agents

BLOCKING rules every AI agent (Claude Code, Cursor, Codex, opencode, …) must follow when working in this repo. Derived from real failure patterns in PR review history.

When a rule is violated, the PR must stay in draft until fixed.

---

## Process rules

### R1 — Plan-grounding

Before opening a `feat: plan …` or any planning PR, **cite an existing peer pattern** in:

- `packages/ui/src/components/` (component family precedent), or
- `apps/registry/registry.ts` (registry category precedent), or
- `specs/shipped/` (prior spec that solved a comparable shape).

No inventing categories or families that don't exist in the design system.

> **Why:** PRs #124–#131 (`feat: plan {system|brand|data|canvas} icon family`) were all closed for: *"Wrong direction: no icon family in the design system."*

### R2 — Diff sanity

Before `gh pr ready` (or marking a draft ready), run:

```bash
git diff --stat origin/main...HEAD
```

Zero diff → close the branch. Don't ship a no-op.

> **Why:** PRs #121, #146 closed because they had zero diff vs `main`.

### R3 — PR body matches HEAD

After every push, **rewrite** the PR body so it matches the current head:

- Validation commands actually run on this commit.
- Screenshots / recordings from this commit.
- CI status as-of-now.
- Listed components match the actual diff.

Stale claims block ship.

> **Why:** PR #103 needed *"removed stale body claims that visual regression and root quality gates already pass."*

### R4 — Manual verification = evidence, not a checkbox

For UI behavior changes, paste the verification command + its output, or attach a screenshot/recording of the verified behavior. Bare ticked checkboxes don't count.

> **Why:** PR #123 reviewer flagged: *"the spec calls for explicit manual verification … I did not find that evidence attached to the PR."*

### R5 — Linked issue required

Every PR body must link a GitHub issue (e.g. `Closes #N`, `Part of #N`, `Related to #N`; full keyword list in [`AGENTS.md`](../../AGENTS.md#quick-reference)). Mirrors the CI gate (`.github/workflows/pr-issue-link.yml`, issue #152, PR #153).

### R6 — Workspace gates green at HEAD

These must all pass on the PR head before requesting merge:

```bash
pnpm -F @vllnt/ui lint
pnpm check:atomic
pnpm -F @vllnt/ui exec tsc --noEmit --project tsconfig.build.json
pnpm build
pnpm test:once
```

Touched-file passes alone are **not** ship-OK. If `tsc` is red package-wide, the PR is red package-wide.

> **Why:** PRs #122, #123, #145 each shipped while `pnpm -F @vllnt/ui exec tsc --noEmit` was red on the branch. Reviewers had to backstop.

### R7 — Codex review reporting

Don't paste *"Codex unavailable: OPENAI_API_KEY unset"* boilerplate into PR comments. Either:

- Codex ran → include findings,
- Codex didn't run → omit the section entirely.

> **Why:** Boilerplate noise across PRs #140, #141, #145, #146, #149, #150, #153.

### R8 — Branch hygiene

If a branch becomes orphaned (rebased away, superseded, or zero-diff), close the PR with a 1-liner pointing at the canonical PR. Don't leave parallel ghost branches.

See [`BRANCHING.md`](./BRANCHING.md).

> **Why:** PR pairs #138/#143, #142/#123, #146/#145 each had review churn from orphaned branches.

---

## Code-quality rules

One line each; the linked [`COMPONENTS.md`](./COMPONENTS.md) section holds the full pattern and examples.

- **R9 — Ref-as-prop + `displayName`.** Every named export, compound subcomponents included, takes `ref` as a prop (React 19, no `forwardRef`), reads context with `use()`, and sets `displayName`. [Pattern](./COMPONENTS.md#the-ref-as-prop--displayname-contract). *Why:* PR #150 (compound parts missing the contract); PR #268 moved it to ref-as-prop.
- **R10 — Semantic root.** A name that implies an HTML element (`Form`, `Nav`, `List`, `Article`, `Header`) renders that element, not `<div role="…">`. [Pattern](./COMPONENTS.md#semantic-root). *Why:* PR #145 (`Form` shipped as a `<div>`).
- **R11 — No dangling ARIA references.** Emit `aria-describedby` / `aria-labelledby` ids only when the target renders. [Pattern](./COMPONENTS.md#aria-describedby--aria-labelledby-must-point-at-rendered-nodes). *Why:* PR #145 (`FormControl` pointed at unrendered nodes).
- **R12 — Don't hijack events from descendants.** Containers check `event.target` before `preventDefault()` on wheel / key / pointer; defer first, hijack last. [Pattern](./COMPONENTS.md#event-handling--dont-hijack-what-isnt-yours). *Why:* PR #139 (`canvas-view` stole wheel and arrow/zoom keys).
- **R13 — Legacy prop = legacy behavior.** Keep a prop's documented behavior, or rename + major bump + migration note. [Pattern](./COMPONENTS.md#legacy-props--legacy-behavior). *Why:* PR #141 (`CanvasShell` slots lost their layout contract).
- **R14 — Prop name = trigger.** Handler names match the real trigger (`onSuggestionClick`, not `onSend`). [Pattern](./COMPONENTS.md#prop-naming--trigger). *Why:* PR #150 (`onSend` fired only on suggestion clicks).
- **R15 — ARIA by spec, not vibe.** Pick roles from Radix / WAI-ARIA Authoring Practices and cite the source in the PR body for non-obvious roles. [Pattern](./COMPONENTS.md#aria--by-spec-not-vibe). *Why:* PR #139 (`role="button"` on a workspace host), PR #140 (`role="status"` on a static marker).

Out-of-scope actions for agents are listed in [`AGENTS.md`](../../AGENTS.md#out-of-scope-for-agents).
