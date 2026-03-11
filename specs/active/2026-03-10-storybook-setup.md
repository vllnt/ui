---
title: "Storybook 10 Setup + Story Scaffolding"
status: active
created: 2026-03-10
estimate: 8-10h
tier: standard
issue: "#83 (Phase 1)"
---

# Storybook 10 Setup + Story Scaffolding

## Context

The @vllnt/ui component library (100 components) has no interactive documentation or playground. Developers rely on a 1700-line `component-preview.tsx` switch statement in the registry app and static Playwright CT snapshots. Storybook 10 provides interactive controls, auto-docs from TypeScript props, and a foundation for Chromatic visual testing and registry iframe embedding (future phases).

This spec covers **Phase 1 only** of issue #83: Storybook 10 initialization, configuration, and story scaffolding for all 100 components. Phases 2-6 (deployment, Chromatic, registry embed, composition) are separate specs.

## Codebase Impact (MANDATORY)

| Area | Impact | Detail |
|------|--------|--------|
| `packages/ui/.storybook/main.ts` | CREATE | Storybook config: framework, addons, stories glob, Vite builder with PostCSS + path aliases + next/* stubs |
| `packages/ui/.storybook/preview.tsx` | CREATE | Global decorators: import styles.css + themes/default.css, ThemeProvider decorator (mounts next-themes + toggles .dark class) |
| `packages/ui/.storybook/next-stubs.ts` | CREATE | Functional mocks for next/* modules: Link→`<a>`, Image→`<img>`, useRouter→`{push,replace,back,...}`, usePathname→`/`, useSearchParams→empty |
| `packages/ui/.storybook/tsconfig.json` | CREATE | TypeScript config for Storybook builder (extends base) |
| `packages/ui/.storybook/vite-shared.ts` | CREATE | Shared Vite config (PostCSS + path aliases) reused by both Storybook and Playwright CT |
| `packages/ui/src/components/**/*.stories.tsx` | CREATE | Story files for 100 components — auto-generated from CVA variants |
| `scripts/generate-stories.ts` | CREATE | Story generator script (parallel to existing generate-tests.ts), `--force` flag skips files with `// manual` header |
| `scripts/check-story-coverage.ts` | CREATE | CI script: scans src/components/*/index.ts, fails if any component dir lacks a .stories.tsx file |
| `packages/ui/package.json` | MODIFY | Add `storybook`, `build-storybook`, `test-storybook` scripts + storybook devDeps; add `storybook-static/` to clean script |
| `turbo.json` | MODIFY | Add `storybook` (persistent, filter: `@vllnt/ui`), `build-storybook`, and `test-storybook` (filter: `@vllnt/ui`) tasks |
| `packages/ui/tsup.config.ts` | MODIFY | Exclude `*.stories.tsx` from dist build |
| `packages/ui/eslint.config.js` | AFFECTED | May need storybook ESLint plugin or story file overrides |
| `packages/ui/src/components/**/*.visual.tsx` | AFFECTED | Coexist with stories — no changes, kept for Playwright CT |
| `packages/ui/playwright-ct.config.ts` | AFFECTED | Vite alias + PostCSS config extracted to shared vite-shared.ts |
| `styles.css` + `themes/default.css` | AFFECTED | Imported by Storybook preview — no changes needed |

**Files:** 8 create | 3 modify | 4 affected
**Reuse:** Playwright CT Vite config extracted to shared module, existing `generate-tests.ts` pattern for story generator, CVA variant definitions for auto-Controls
**Breaking changes:** None — additive only
**New dependencies:** `storybook@10`, `@storybook/react-vite@10`, `@storybook/addon-essentials@10`, `@storybook/addon-a11y`, `@storybook/addon-themes`, `@storybook/addon-mcp`, `@storybook/test-runner`, `@storybook/addon-designs` (all devDeps)

## User Journey (MANDATORY)

### Primary Journey

ACTOR: Component library developer
GOAL: Browse and interact with all @vllnt/ui components in Storybook
PRECONDITION: Repository cloned, dependencies installed

1. Developer runs `pnpm storybook` from packages/ui
   -> System starts Storybook dev server on localhost:6006
   -> Developer sees Storybook UI with sidebar listing all 100 components

2. Developer clicks a component in sidebar (e.g., Button)
   -> System renders Button story with default args
   -> Developer sees live Button component with Controls panel showing CVA variants (size, variant)

3. Developer changes variant in Controls panel (e.g., variant: "destructive", size: "lg")
   -> System re-renders Button with new props in real-time
   -> Developer sees updated component with correct Tailwind styles

4. Developer toggles dark mode via toolbar
   -> System applies `.dark` class and CSS variable overrides
   -> Developer sees component in dark theme

5. Developer clicks "Docs" tab
   -> System shows auto-generated documentation from TypeScript props
   -> Developer sees prop table, description, and all stories inline

POSTCONDITION: All 100 components browsable with interactive controls, dark/light theme, and auto-docs

### Error Journeys

E1. Storybook fails to start (missing CSS/PostCSS)
   Trigger: styles.css not imported or PostCSS not configured in Storybook Vite config
   1. Developer runs `pnpm storybook`
      -> System shows build error: "Cannot resolve styles.css" or unstyled components
      -> Developer sees error in terminal
   2. Developer checks `.storybook/preview.tsx` imports
      -> System guides to CSS import fix
   Recovery: Storybook restarts with correct CSS

E2. Story file import error (component not found)
   Trigger: Story imports from wrong path or component renamed
   1. Developer opens Storybook
      -> System shows "Failed to fetch" or blank story
      -> Developer sees red error overlay with stack trace
   2. Developer fixes import path in .stories.tsx
      -> System hot-reloads story
   Recovery: Story renders correctly

E3. Build-storybook fails (TypeScript errors in stories)
   Trigger: Story file has type errors that dev server ignores but build catches
   1. Developer runs `pnpm build-storybook`
      -> System shows TypeScript error with file path and line number
      -> Developer sees actionable error message
   2. Developer fixes type error in story file
      -> System builds successfully
   Recovery: Static Storybook build completes

### Edge Cases

EC1. Component with no CVA variants (e.g., Separator): Story renders default with no Controls
EC2. Compound components (Dialog, DropdownMenu): Story shows full composition with sub-components
EC3. Components requiring providers (ThemeProvider, next-themes): Decorator mounts next-themes ThemeProvider AND toggles `.dark` class on `document.documentElement`
EC4. Provider-dependent compounds (Sidebar→SidebarProvider, Toast→Toaster): Stories must wrap in required provider
EC5. Components with complex props (ReactNode children, render props): Args use template pattern
EC6. "use client" components: Storybook runs client-side, no SSR issues

## Acceptance Criteria (MANDATORY)

### Must Have (BLOCKING — all must pass to ship)

- [ ] AC-1: GIVEN packages/ui with Storybook configured WHEN developer runs `pnpm storybook` THEN Storybook dev server starts on localhost:6006 without errors
- [ ] AC-2: GIVEN Storybook running WHEN developer opens sidebar THEN all 100 components are listed and navigable
- [ ] AC-3: GIVEN a component story (e.g., Button) WHEN developer views it THEN component renders with correct Tailwind styles and CSS variables
- [ ] AC-4: GIVEN a component with CVA variants WHEN developer opens Controls panel THEN all variants are interactive (dropdown/radio for each variant prop)
- [ ] AC-5: GIVEN Storybook toolbar WHEN developer toggles dark mode THEN component re-renders with dark theme CSS variables
- [ ] AC-6: GIVEN any component story WHEN developer clicks Docs tab THEN auto-generated prop table is shown with types from TypeScript
- [ ] AC-7: GIVEN the project WHEN developer runs `pnpm build-storybook` THEN static Storybook builds to `storybook-static/` without errors

### Error Criteria (BLOCKING — all must pass)

- [ ] AC-E1: GIVEN Storybook config WHEN styles.css or theme CSS is missing THEN build fails with clear error message pointing to the missing import
- [ ] AC-E2: GIVEN a story with wrong import path WHEN Storybook loads THEN error overlay shows file path and specific import that failed
- [ ] AC-E3: GIVEN story files with TypeScript errors WHEN `build-storybook` runs THEN errors are reported with file:line and actionable message

- [ ] AC-8: GIVEN compound components (Dialog, Sheet, DropdownMenu, Sidebar, Toast — top 5) WHEN stories render THEN full composition with sub-components + required providers is shown
- [ ] AC-9: GIVEN components importing next/* (breadcrumb, blog-card, navbar-saas, pagination, sidebar, etc.) WHEN Storybook renders THEN next-stubs provide functional mocks (Link navigates, Image renders, useRouter returns mock router)

### Should Have (ship without, fix soon)

- [ ] AC-10: GIVEN a component directory under src/components/ WHEN it exports a component THEN a corresponding .stories.tsx file exists (enforced by CI check)
- [ ] AC-11: GIVEN the `generate-stories.ts` script WHEN developer runs `pnpm storybook:generate` THEN story stubs are created for components missing stories (skips files with `// manual` header)
- [ ] AC-12: GIVEN compound components beyond top 5 WHEN stories render THEN full composition with sub-components is shown

## Scope

- [ ] 0. **GATE**: 1h spike — verify SB10 + React 19 + all addons (essentials, a11y, themes, MCP, test-runner, designs) install cleanly in packages/ui, resolve any peer dep conflicts -> Kill criteria gate
- [ ] 1. Initialize Storybook 10 with React-Vite framework -> AC-1, AC-E1
- [ ] 2. Create next-stubs.ts with functional mocks (Link→`<a>`, Image→`<img>`, useRouter→mock router, usePathname→`/`, useSearchParams→empty URLSearchParams) -> AC-9
- [ ] 3. Extract shared Vite config (PostCSS + aliases) from playwright-ct.config.ts to .storybook/vite-shared.ts, update both configs -> DRY
- [ ] 4. Configure .storybook/preview.tsx with CSS imports + ThemeProvider decorator (mount next-themes + toggle .dark class) -> AC-3, AC-5
- [ ] 5. Configure .storybook/main.ts with stories glob + addons (essentials, a11y, themes, MCP, designs) + next/* Vite aliases -> AC-2, AC-6, AC-9
- [ ] 6. Exclude *.stories.tsx from tsup build -> AC-7
- [ ] 7. Add storybook scripts to package.json (incl. storybook-static/ in clean) + turbo.json (filter: @vllnt/ui) -> AC-1, AC-7
- [ ] 8. Create story generator script (generate-stories.ts) with --force overwrite protection -> AC-11
- [ ] 8b. Create story coverage check script (check-story-coverage.ts) + add `check:stories` to package.json + turbo lint pipeline -> AC-10
- [ ] 9. Generate stories for all 100 components with CVA variant args -> AC-2, AC-4
- [ ] 10. Manually refine top 5 compound stories (Dialog, Sheet, DropdownMenu, Sidebar, Toast) with providers -> AC-8
- [ ] 11. Add `test-storybook` script + configure @storybook/test-runner -> smoke test all stories
- [ ] 12. Verify build-storybook produces static output -> AC-7, AC-E3

### Out of Scope

- Storybook deployment (storybook.vllnt.com) — Phase 3
- Chromatic visual testing — Phase 4
- Registry iframe embedding — Phase 5
- Storybook composition for consumers — Phase 6
- Converting .visual.tsx to stories — coexist, don't migrate
- Custom Storybook theme/branding — nice-to-have, not Phase 1
- @storybook/addon-mcp advanced configuration (custom toolsets, CI integration) — installed + default config only in Phase 1
- @storybook/addon-designs Figma file linking per story — installed, configure per-component in Phase 2+
- @storybook/test-runner CI integration (run in GitHub Actions) — installed + local smoke test only in Phase 1

## Quality Checklist

### Blocking (must pass to ship)

- [ ] All Must Have ACs passing
- [ ] All Error Criteria ACs passing
- [ ] All scope items implemented
- [ ] No regressions in existing tests (vitest + playwright CT)
- [ ] Error states handled (not just happy path)
- [ ] No hardcoded secrets or credentials
- [ ] `pnpm storybook` starts without errors
- [ ] `pnpm build-storybook` completes without errors
- [ ] All 100 components appear in Storybook sidebar
- [ ] `pnpm check:stories` passes (100% story coverage)
- [ ] Dark/light theme toggle works for all stories
- [ ] tsup build still excludes stories from dist/
- [ ] next/* stub components render without errors for all 9 affected components
- [ ] Existing Playwright CT tests still pass (shared Vite config refactor)

### Advisory (should pass, not blocking)

- [ ] All Should Have ACs passing
- [ ] Story files follow component directory convention ({name}.stories.tsx)
- [ ] Controls panel shows meaningful labels (not raw prop names)
- [ ] Auto-docs prop table renders complete TypeScript types
- [ ] generate-stories.ts --force respects `// manual` header (no overwrite)

## Test Strategy (MANDATORY)

### Test Environment

| Component | Status | Detail |
|-----------|--------|--------|
| Test runner | Detected | Vitest 4.0.16 (jsdom, globals) |
| E2E framework | Detected | Playwright CT 1.57.0 (chromium snapshots) |
| Test DB | N/A | No database |
| Mock inventory | Minimal | vi.useFakeTimers() only, no API mocks |

### AC -> Test Mapping

| AC | Test Type | Test Intention |
|----|-----------|----------------|
| AC-1 | E2E (process) | `pnpm storybook` starts, HTTP 200 on localhost:6006 |
| AC-2 | E2E (browser) | Storybook sidebar lists all 100 component names |
| AC-3 | E2E (browser) | Button story renders with Tailwind classes applied |
| AC-4 | E2E (browser) | Changing variant Control updates rendered component |
| AC-5 | E2E (browser) | Toggling dark mode applies .dark class and CSS vars |
| AC-6 | E2E (browser) | Docs tab shows prop table with TypeScript types |
| AC-7 | Unit (process) | `pnpm build-storybook` exits 0, storybook-static/ exists |
| AC-E1 | Unit (build) | Missing CSS import causes build failure with clear message |
| AC-E2 | E2E (browser) | Wrong import shows error overlay with file path |
| AC-E3 | Unit (build) | TS error in story causes build failure with file:line |

### Failure Mode Tests (MANDATORY)

| Source | ID | Test Intention | Priority |
|--------|----|----------------|----------|
| Error Journey | E1 | Build: verify CSS import is present and Tailwind processes correctly | BLOCKING |
| Error Journey | E2 | E2E: story with bad import shows error overlay (not blank page) | BLOCKING |
| Error Journey | E3 | Build: TS error in story produces actionable build error | BLOCKING |
| Edge Case | EC1 | E2E: Separator story (no CVA) renders without Controls crash | Advisory |
| Edge Case | EC2 | E2E: Dialog compound story shows all sub-components | Advisory |
| Failure Hypothesis | FH-1 (HIGH) | Build: verify tsup excludes *.stories.tsx from dist | BLOCKING |
| Failure Hypothesis | FH-2 (MED) | E2E: next-themes ThemeProvider works in Storybook (no Next.js context) | BLOCKING |
| Failure Hypothesis | FH-3 (MED) | Build: storybook addons resolve without version conflicts (validated by spike gate) | BLOCKING |
| Failure Hypothesis | FH-4 (HIGH) | E2E: next/* stubs (useRouter, useSearchParams) provide functional returns, not just empty aliases | BLOCKING |
| Failure Hypothesis | FH-5 (MED) | E2E: provider-dependent components (Sidebar, Toast) render when wrapped in required provider decorator | BLOCKING |
| Failure Hypothesis | FH-6 (MED) | Build: shared Vite config refactor doesn't break existing Playwright CT tests | BLOCKING |

### Mock Boundary

| Dependency | Strategy | Justification |
|------------|----------|---------------|
| next-themes | Mount in decorator | ThemeProvider mounted in preview decorator + manual `.dark` class toggle on `document.documentElement` |
| next/link | Functional stub → `<a>` | Passive consumer — renders as anchor tag with href passthrough |
| next/image | Functional stub → `<img>` | Passive consumer — renders as img with src/alt/width/height passthrough |
| next/navigation (useRouter) | Functional mock | Active consumer — returns `{push: console.log, replace: console.log, back: console.log, forward: console.log, refresh: noop, prefetch: noop}` |
| next/navigation (usePathname) | Functional mock | Returns `"/"` — static default sufficient for story rendering |
| next/navigation (useSearchParams) | Functional mock | Returns `new URLSearchParams()` — empty params for story context |
| @xyflow/react | Real | Works standalone, no server dependency |
| embla-carousel | Real | Client-only, works in Storybook |

### TDD Commitment

All tests written BEFORE implementation (RED -> GREEN -> REFACTOR).
Every Must Have + Error AC tracked in e2e-scenarios registry.

## Risks

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| Storybook 10 + React 19 + addon compatibility | HIGH | MED | **Scope item 0 (spike gate)**: 1h install + verify before any config work. Kill criteria if unresolvable in <2h. |
| next-themes ThemeProvider fails outside Next.js | MED | MED | Decorator mounts ThemeProvider AND manually toggles `.dark` class — dual strategy covers both CSS var and class-based theming |
| next/* stubs return wrong shape, components crash | HIGH | MED | Functional mocks with correct return types. Tiered: passive (Link→`<a>`, Image→`<img>`) vs active (useRouter→mock object). Test each of 9 affected components. |
| Provider-dependent components render blank | MED | HIGH | Identify all provider deps (Sidebar→SidebarProvider, Toast→Toaster, etc.) during story generation. Wrap in provider decorator per component. |
| Story generator misses component variants | MED | LOW | Cross-check against component-preview.tsx switch cases. Manual refinement pass. |
| Story generator --force overwrites manual refinements | MED | MED | `--force` skips files with `// manual` header comment. Default mode skips existing files entirely. |
| Storybook devDeps bloat (SB is large) | LOW | HIGH | devDeps only, not in published package. Monitor install size. |
| PostCSS/Tailwind config mismatch between Playwright CT and Storybook | MED | LOW | Extract shared Vite config to `vite-shared.ts`, both configs import from single source |
| Shared Vite config refactor breaks Playwright CT | MED | LOW | Run existing Playwright CT suite after refactor as regression check |
| pnpm-lock.yaml change triggers unwanted canary publish | MED | HIGH | turbo `build-storybook` task scoped to `@vllnt/ui` only; storybook-static/ excluded from dist; no publish path changes |

**Kill criteria:** If Storybook 10 has blocking incompatibility with React 19 or Tailwind 3 that can't be resolved in <2h (scope item 0 spike), fall back to Storybook 9.

## State Machine

**Status**: N/A — Stateless feature

**Rationale**: Storybook setup is a static configuration + code generation task. No persistent state transitions, no user state management. Build -> output.

## Analysis

### Assumptions Challenged

| Assumption | Evidence For | Evidence Against | Verdict |
|------------|-------------|-----------------|---------|
| Storybook 10 supports React 19 | SB10 release notes list React 19 support, ESM-only aligns with React 19 | React 19 is bleeding edge, some SB addons may lag | RISKY — spike gate (scope 0) validates before committing |
| CVA variants can auto-generate Storybook Controls | CVA exports variant types, SB `argTypes` can map to enum Controls | CVA uses complex TypeScript types that SB may not auto-detect | RISKY — may need explicit argTypes mapping |
| next-themes ThemeProvider works in Storybook | It's a React context, should work anywhere | It expects Next.js `<html>` attribute management, may fail headless | MITIGATED — dual strategy: mount ThemeProvider + manual .dark toggle |
| next/* stubs are sufficient as empty aliases | Simple aliasing pattern, works for passive consumers | Active consumers (useRouter, useSearchParams) need functional return values, not empty modules | INVALID — need tiered functional mocks |
| 100 stories can be auto-generated | generate-tests.ts already does variant extraction + template generation | Stories need more nuance (composition, children, interactions, provider wrapping) | VALID for scaffolding, manual refinement needed for compounds + provider-deps |
| Existing PostCSS/Tailwind config works in Storybook | Playwright CT uses identical Vite + PostCSS setup successfully | Storybook Vite builder may handle PostCSS differently | VALID — both use Vite, extracted to shared config |
| All components render standalone | Most are pure UI | Sidebar needs SidebarProvider, Toast needs Toaster wrapper | PARTIALLY VALID — must enumerate provider-dependent components |

### Blind Spots

1. **[Integration]** Components importing from `next/image`, `next/link`, or other Next.js modules will fail in Storybook without aliases or mocks.
   Why it matters: 9 components use next/* — need tiered functional stubs, not empty aliases. Active consumers (useRouter, useSearchParams) must return correct shapes.

2. **[Integration]** Provider-dependent components (Sidebar→SidebarProvider, Toast→Toaster) render blank without their context provider.
   Why it matters: Stories silently render nothing — no error, just empty canvas. Must enumerate and wrap all provider-dependent components.

3. **[Performance]** Loading 100 component stories in dev mode may be slow on initial load. Storybook lazy-loads, but the story index build could be heavy.
   Why it matters: Slow dev startup kills DX — the whole point of Storybook.

4. **[Maintenance]** No automated check that new components get stories. Easy to add a component and forget the story.
   Why it matters: Story coverage will degrade over time without enforcement (Phase 2+ concern).

5. **[CI]** pnpm-lock.yaml changes from storybook devDeps may trigger canary publish workflow. `build-storybook` output must not leak into publish paths.
   Why it matters: False canary publishes waste CI time and confuse consumers.

### Failure Hypotheses

| IF | THEN | BECAUSE | Severity | Mitigation |
|----|------|---------|----------|------------|
| Components import `next/image` or `next/link` | Storybook build fails with module not found | Next.js modules unavailable outside Next.js runtime | HIGH | Tiered Vite aliases in main.ts: passive (Link→`<a>`, Image→`<img>`), active (useRouter→mock router object with push/replace/back) |
| useRouter/useSearchParams stubs return wrong shape | Component crashes at runtime (not build) | Active consumers call `.push()`, `.get()` etc. on returned objects | HIGH | Functional mocks return correct TypeScript-compliant shapes. Test all 9 affected components individually. |
| next-themes ThemeProvider is used as decorator | Theme toggle doesn't work or SSR error | next-themes expects Next.js Script/html attribute injection | MED | Dual strategy: mount ThemeProvider in decorator AND manually toggle `.dark` class on `document.documentElement` |
| Provider-dependent components (Sidebar, Toast) render blank | Story shows empty canvas, no error | Component reads from React context that doesn't exist | MED | Enumerate provider-deps during story gen. Wrap in provider decorator. Add FH-5 test. |
| Storybook devDeps conflict with existing deps | pnpm install fails or version resolution error | SB10 may pin specific React/React-DOM versions conflicting with workspace | MED | Spike gate (scope 0) catches this before any config work. Use `pnpm.overrides` if needed. |
| Shared Vite config refactor breaks Playwright CT | Existing visual snapshot tests fail | Config extraction changes import paths or build behavior | MED | Run full Playwright CT suite after refactor. Rollback if regressions. |
| generate-stories --force overwrites manually refined stories | Manual work lost | No protection for hand-edited story files | MED | `--force` skips files with `// manual` header. Default mode never overwrites existing files. |

### The Real Question

Confirmed — spec solves the right problem. The library needs interactive documentation. Storybook is the industry standard. The existing generate-tests.ts pattern proves the team already automates per-component scaffolding, making story generation a natural extension. Phase 1 (setup + scaffold) is the correct first step before deployment or visual testing phases.

### Component Classification

**Tier 1 — Pure UI** (no external deps): Button, Badge, Card, Input, Separator, etc. (~85 components)
**Tier 2 — Passive next/* consumers** (Link, Image only): breadcrumb, blog-card, navbar-saas, pagination, profile-section (~5 components)
**Tier 3 — Active next/* consumers** (useRouter, usePathname, useSearchParams): category-filter, lang-provider, search-bar, sidebar, view-switcher (~4-5 components)
**Tier 4 — Provider-dependent**: Sidebar→SidebarProvider, Toast→Toaster (enumerate during scope 9)

### Open Items

- [resolved] 9 components import from `next/` → addressed: tiered functional mocks in next-stubs.ts (scope 2)
- [resolved] Addon compatibility risk → addressed: spike gate (scope 0), includes @storybook/addon-mcp (requires SB >=9.1.16, verify SB10 compat)
- [resolved] Story overwrite risk → addressed: `// manual` header protection (scope 8)
- [resolved] CI check that every component has a .stories.tsx -> addressed: check-story-coverage.ts (scope 8b)
- [question] Should story generator reuse component-preview.tsx demo logic or start fresh? -> explore at implementation
- [question] Full list of provider-dependent components → enumerate during scope 9 story generation

## Notes

## Progress

| # | Scope Item | Status | Iteration |
|---|-----------|--------|-----------|
| 0 | Spike: SB10 + React 19 + addons | pending | - |
| 1 | Initialize Storybook 10 | pending | - |
| 2 | Create next-stubs.ts | pending | - |
| 3 | Extract shared Vite config | pending | - |
| 4 | Configure preview.tsx | pending | - |
| 5 | Configure main.ts + next/* aliases | pending | - |
| 6 | Exclude stories from tsup | pending | - |
| 7 | Add scripts + turbo.json (scoped) | pending | - |
| 8 | Create story generator (--force protection) | pending | - |
| 8b | Create story coverage check script | pending | - |
| 9 | Generate all 100 stories | pending | - |
| 10 | Refine top 5 compound stories | pending | - |
| 11 | Configure test-runner + smoke tests | pending | - |
| 12 | Verify build-storybook | pending | - |

## Timeline

| Action | Timestamp | Duration | Notes |
|--------|-----------|----------|-------|
| plan | 2026-03-10T16:50:00Z | - | Created from issue #83 Phase 1 |
| spec-review | 2026-03-10T17:30:00Z | - | 4-perspective adversarial review, 10 findings applied |
