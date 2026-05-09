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

### R5 — Issue link required

Every PR body must contain `Closes #N`, `Fixes #N`, or `Related to #N`. Mirrors the CI gate (`.github/workflows/pr-issue-link.yml`, issue #152, PR #153).

### R6 — Workspace gates green at HEAD

These must all pass on the PR head before requesting merge:

```bash
pnpm -F @vllnt/ui lint
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

See [`COMPONENTS.md`](./COMPONENTS.md) for the full pattern catalog. Summary of what's BLOCKING:

### R9 — Compound `forwardRef` + `displayName`

Every named export — including compound subcomponents (`Card.Header`, `Conversation.Title`, `Form.Field`) — has `React.forwardRef` and a set `displayName`.

> **Why:** PR #150 needed an auto-fix to add `forwardRef` to all 8 compound parts of `ConversationThread`.

### R10 — Semantic root

If the component name implies an HTML element (`Form`, `Nav`, `List`, `Article`, `Header`), the root **renders that element**. `<div role="…">` is a smell — rename, or use the real tag.

> **Why:** PR #145: `Form` shipped as a styled `<div>` while docs presented it as the form primitive.

### R11 — No dangling ARIA references

`aria-describedby` and `aria-labelledby` only emit when the referenced node will render. Generated ids must be conditional, not unconditional.

> **Why:** PR #145 `FormControl` composed `aria-describedby` with ids that pointed at nothing when no `FormDescription` / `FormMessage` was rendered.

### R12 — Don't hijack events from descendants

For container components (canvas, scroll wrappers, key-shortcut hosts): before `preventDefault()` on wheel / key / pointer handlers, check `event.target` is not a nested scroll container or interactive element. Defer first, hijack last.

> **Why:** PR #139 — `canvas-view` globally prevented wheel and stole arrow/zoom keys, breaking nested scrollers and inputs.

### R13 — Legacy prop = legacy behavior

Keeping a prop name but changing its layout/behavior is a breaking change. Either preserve the documented behavior, or rename + bump major + write a migration note.

> **Why:** PR #141 — `leftRail` / `rightDock` / `bottomSlot` on `CanvasShell` survived as names but lost their grid/full-width contract.

### R14 — Prop name = trigger

Event-handler prop names map to the actual trigger. `onSend` fires on send, not on suggestion click. If unsure, qualify (`onSuggestionClick`).

> **Why:** PR #150 — `onSend` only fired on suggestion clicks; reviewer flagged the misleading name.

### R15 — ARIA by spec, not vibe

Pick roles from Radix's pattern + WAI-ARIA Authoring Practices, not intuition. When introducing a non-obvious role, cite the source in the PR body.

> **Why:** PR #139 (`role="button"` on a complex workspace host), PR #140 (`role="status"` on a static marker).

---

## Out of scope for agents

- Don't modify `LICENSE`, `CODE_OF_CONDUCT.md`, or `SECURITY.md` without explicit human authorization.
- Don't add new dependencies without explaining the tradeoff (bundle size, maintenance, security surface).
- Don't publish, push to `main`, or merge PRs without explicit authorization.
- Don't hand-edit generated files (`apps/registry/lib/component-metadata.json`, dist outputs). Regenerate via the documented script.
