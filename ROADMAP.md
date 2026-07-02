# Roadmap

> **Goal:** the design-system foundation for building UI fast — the @vllnt/ui component registry (web + native), the `@vllnt/ui-cli` DX gate, and `@vllnt/front-studio` + `@vllnt/ui-toolbar` (verify · review · author, API-first) — for humans and agents alike.
> **Now:** `component-sidebar` — finish `.5`/`.6`, then ship `@vllnt/ui@0.4.0`.
> **Next:** `agent-ui-cli` (MVP) · `ai-elements-parity`.
> **Horizon (gated):** `native-parity` (needs an RN consumer) · the front-studio line (`studio` → `studio-hub` — after the CLI ships + a real need).
> **Visibility track:** SEO/GEO phases — `search-consolidation` → `ai-toolchain-registration` → `visibility-measurement` → `seo-content-engine` → `backlink-authority`. Diagnosis: infra is DONE (`agent-surface`) but GSC shows indexed-yet-buried (141 pages, 2 clicks/90d, 0 AI-query visibility) + a dead `.com` twin outranking the live `.ai`. Full plan: [strategy dossier](https://claude.ai/code/artifact/6e2359db-a626-4226-aa54-a9e53ecfd766).
> **Last updated:** 2026-07-02
> **Channels:** `@latest` = `0.3.0` · `@canary` = `0.4.0-canary.<sha>` (auto-publishes on every merge to main). Tracking: [milestone 0.3.0](https://github.com/vllnt/ui/milestone/1)

Convention: phases are kebab-case outcome slugs, ordered DONE → ACTIVE → PLANNED. Tasks carry stable `<slug>.<n>` IDs; functional tasks pair with a `Validate`/`E2E` task. History is never deleted. Shipped 0.3.0 detail lives in `CHANGELOG.md` and the 197 closed issues; phases below summarize it.

---

## component-library [DONE 2026-06]

**Goal:** Grow the registry into a comprehensive set spanning forms, data, content, AI, maps, canvas, and timelines.
— 4/4 tasks · shipped `@vllnt/ui@0.3.0` · full detail in Archive (bottom).

## agent-surface [DONE 2026-06]

**Goal:** Full SEO + AI-agent discoverability for the registry site.
— 9/9 tasks · shipped 2026-06 · full detail in Archive (bottom).

## codebase-health [DONE 2026-06]

**Goal:** A `react-doctor` CI gate so the library ships and stays green.
— 4/4 tasks · shipped 2026-06 (score 71 → `react-doctor-90` in Later) · full detail in Archive (bottom).

## release-pipeline [DONE 2026-06]

**Goal:** A canary → stable publish model with hard safeguards.
— 3/3 tasks · shipped 2026-06 (0.3.0 stable · 0.4.0 canary open) · full detail in Archive (bottom).

---

## component-sidebar [ACTIVE]

**Goal:** Navigate 309 components via a single-pane **drill-down** — families list ⇄ one family's components — synced to the breadcrumb, so the sidebar never shows more than one family at once.
**Exit criteria:** On `/components/[slug]` the sidebar auto-drills to the component's family (pinned docs-essentials on top, that family's components only, active item marked) with a "← All families" back; breadcrumb reads `Components / Family / Component`; a global filter + ⌘K jump to any component cross-family; last-family + scroll persist; keyboard-only + mobile pass.
**Verify:** a dev opening `/components/button` sees the sidebar drilled into **Form** (Button active) and breadcrumb `Components › Form › Button`; "← All families" returns to the 12-family list; filter "globe" (cross-family) drills to Globe3D; reload keeps Form drilled. Personas: browsing dev (desktop + mobile, keyboard-only); maintainer adding a categorized component (auto-appears in its family).

Single-pane drill-down (chosen over accordion-single-open and a two-pane family rail — it matches the breadcrumb model and only ever shows one family). Grouping derives from the existing `category` enum (12 families: utility 51, data 45, content 43, form 38, learning 30, core 26, navigation 23, data-display 21, overlay 15, ai 9, educational 5, billing 3), so it stays zero-maintenance. UI-layer only — no schema change. Locked UX decisions: pinned top = docs-essentials (Overview, Getting Started, Theming); filter + ⌘K = global cross-family; ROOT = families-only list.

**SYNC 2026-07-02 — #462 shipped the drill-down.** Done: `.1`/`.2`/`.3`/`.4` + core E2E (`apps/registry/e2e/sidebar-drilldown.spec.ts`). Remaining: `.5` (global filter → drill to family) · `.6` (slide transitions + persist).

- [x] component-sidebar.1 Two-level drill-down state (`ROOT` ⇄ `FAMILY`): ROOT = families list (count + chevron), FAMILY = one family's components only (`apps/registry/lib/sidebar-sections.ts` + `@vllnt/ui` Sidebar) — #462
- [x] component-sidebar.2 Auto-drill from route: `/components/[slug]` opens `FAMILY(category)` with the active item; "← All families" + breadcrumb `Components` pop to ROOT — #462
- [x] component-sidebar.3 Pin docs-essentials (Overview, Getting Started, Theming) above both levels — #462
- [x] component-sidebar.4 Breadcrumb sync: `Components / Family / Component`; the Family + Components segments drive the sidebar level — #462
- [ ] component-sidebar.5 Global filter + ⌘K (reuse the existing Command + SearchDialog/pagefind index): a cross-family match drills to its family; virtualize families > 25 items
- [ ] component-sidebar.6 Directional slide transition with `prefers-reduced-motion` instant fallback; persist last-family + scroll (localStorage)
- [~] component-sidebar.7 Validate component-sidebar.1–6: Playwright E2E (desktop + mobile + keyboard) — auto-drill, back, breadcrumb sync, global filter, ⌘K, persistence (E2E); core drill-down (`.1`/`.2`/`.4`) covered by `sidebar-drilldown.spec.ts` — pending `.5`/`.6`

## native-parity [PLANNED]

**Goal:** Make all 309 @vllnt/ui components iso web↔native — install once from the single `ui.vllnt.ai` registry, one import, platform-correct render — with no second registry.
**Exit criteria:** Every component ships a `<c>.native.tsx` twin + a shared `<c>.variants.ts`; one `npx shadcn add @vllnt/<c>` from `ui.vllnt.ai/r/<c>.json` installs both files; each renders correctly on a Next.js web app AND an Expo device; each is stamped `parity: full|api-only` in `meta.json` with the badge shown on the site.
**Verify:** a consumer dev runs `npx shadcn add @vllnt/button` once → `import { Button }` renders on web (Radix/DOM) and on an Expo device (rn-primitives) with an identical variant API across all 12 families; the overlay family is documented `api-only` where Portal/keyboard can't map. Personas: consumer dev (web + Expo device, keyboard), maintainer (adds a native twin + variants contract), agent (reads `parity` from the registry JSON).

**Gated by:** a confirmed Expo/RN consumer (`native-parity.1`) — **Horizon** until resolved (flagged since 2026-06; still open).

One registry, not two — platform is resolved by the bundler (Metro picks `<c>.native.tsx`, web picks `<c>.tsx`), so `ui.vllnt.ai` stays the single source. Stack maps 1:1: Radix → @rn-primitives, Tailwind `className` → NativeWind, CVA + `cn()` unchanged, lucide-react → lucide-react-native. Only the render body forks; `<c>.variants.ts` (CVA + a platform-neutral prop contract) is shared. Iso *API* is always achievable; iso *visual result* is a per-component property (the `parity` badge) — overlays / hover / keyboard degrade to api-only. Proven prior art: **react-native-reusables** (@rn-primitives + NativeWind, 8.4k★, active 2026) already publishes a shadcn-format `registry.json` for RN — one schema spans web+native, validating the single-registry bet. Open gate: a confirmed Expo consumer (`.1`); OKLCH-on-native is resolved — NativeWind v4 (stable) has no on-device `oklch()`, so an HSL fallback is required (`.2`).

- [ ] native-parity.1 Decide: confirm an Expo/RN consumer app + the native stack (NativeWind + @rn-primitives + lucide-react-native)
- [ ] native-parity.2 Emit an HSL fallback channel for the native theme (RESEARCHED 2026-07): NativeWind v4 (stable) has no on-device `oklch()` — RNR themes in HSL; native OKLCH is gated on NativeWind v5 (preview). Spike confirms the down-convert on a device; tweakcn already exports OKLCH+HSL from one source
- [ ] native-parity.3 Decide: one registry, multi-file items (`<c>.tsx` + `<c>.native.tsx`, bundler-resolved) — single `ui.vllnt.ai`, no second namespace
- [ ] native-parity.4 Token codegen: emit the RN/NativeWind theme from `tokens.json` alongside the web CSS vars (single source)
- [ ] native-parity.5 Establish the iso pattern: extract `<c>.variants.ts` (CVA + platform-neutral prop contract) + ship a 5-component reference set (button, input, card, badge, dialog)
- [ ] native-parity.6 Extend `apps/registry/scripts/inline-component-source.ts` to emit `<c>.native.tsx` + the shared variants per registry item; stamp `parity: full|api-only` in `meta.json`; surface the badge on `ui.vllnt.ai`
- [ ] native-parity.7 Port core + form + utility families (115) to native twins
- [ ] native-parity.8 Port data + data-display + content families (109) to native twins
- [ ] native-parity.9 Port navigation + learning + educational + billing + ai families (70) to native twins
- [ ] native-parity.10 Port overlay family (15) — api-only parity where Portal/keyboard can't map; document the degradation
- [ ] native-parity.11 Validate native-parity.5–10: one `shadcn add @vllnt/<c>` from `ui.vllnt.ai` → identical import renders on Next web + Expo device across all 12 families; parity badges accurate (E2E)
- [ ] native-parity.12 Validate native-parity.4: an off-token native color fails; `tokens.json` stays the sole source across web CSS + RN theme (E2E)

## ai-elements-parity [PLANNED]

**Goal:** Close the gap vs shadcn AI Elements (~48 components); ship the chat/agent-core set we lack.
**Exit criteria:** Tier-1 (7) shipped with story + test + registry entry; a demo composes them end-to-end.
**Verify:** a demo page renders Message + Context + Task + Plan + Confirmation + Attachments + MessageActions + MessageBranch in one chat flow.

- [ ] ai-elements-parity.1 `Context` — token / context-window usage meter
- [ ] ai-elements-parity.2 `Task` — atomic work-item card (we have the chain, not the unit)
- [ ] ai-elements-parity.3 `Plan` — structured plan with an approve step
- [ ] ai-elements-parity.4 `Confirmation` — approve-before-action gate (wraps `AlertDialog`)
- [ ] ai-elements-parity.5 `Attachments` — file / media upload in the prompt composer
- [ ] ai-elements-parity.6 `MessageActions` — per-message action bar (copy / retry / edit)
- [ ] ai-elements-parity.7 `MessageBranch` — message version switcher
- [ ] ai-elements-parity.8 Tier-2 stretch: `Checkpoint`, `RequestQueue`, `OpenInChat`, `AIImage`
- [ ] ai-elements-parity.9 Validate ai-elements-parity.1–7: story + test per component + composed chat E2E (E2E)

Deferred families (Later): voice (6), IDE code surfaces (9), workflow canvas (5).

## agent-ui-cli [PLANNED]

**Goal:** One fast-installing command for any agent or dev to manage the whole client side + design system on `@vllnt/ui`. Four pillars: single entry · extremely fast install · common across projects · covers the whole client side.
**Exit criteria (MVP):** `gate` returns an identical pass/fail locally and in CI on a sample consumer; `theme check` fails a deliberately broken-contrast preset and passes the 16 shipped; `tokens check` fails on CSS-var drift and passes when `tokens.json` is the sole source; `init` wires pre-commit + CI to `vllnt-ui gate` with no hand-edits; `status` prints a weighted (blocking-first) readiness checklist an agent can drive from any % to green via `init`, then hold with `gate`; cold `npx <cli>@latest gate` runs with no component-lib download.
**Verify:** run it like a consumer — a sample repo's pre-commit + PR both call `vllnt-ui gate`; an off-token color fails `check`; `vllnt-ui status --json` on a bare repo lists every missing automation with its fix command, and `init` drives it to 100% ✔. Full command spec + readiness rubric in the appendix.

- [ ] agent-ui-cli.1 `context` — emit rules + tokens + component index as JSON
- [ ] agent-ui-cli.2 `check` — design-lint on usage (off-token color, missing `use client`, off-scale spacing); `--fix`
- [ ] agent-ui-cli.3 `tokens check` (L0, owned) — token-system correctness + single-source sync + OKLCH gamut
- [ ] agent-ui-cli.4 `theme check` (L0, owned) — WCAG contrast + token parity across 16 presets × light/dark
- [ ] agent-ui-cli.5 reduced-motion lint (L0, owned)
- [ ] agent-ui-cli.6 `gate` — compose L0 + L1 (lint) + L2 (tsc); one verdict; `--staged` / `--scope changed`
- [ ] agent-ui-cli.7 `init` / `sync` — scaffold + version-pin the shared config bundle; `init` scaffolds **every ✖ row `status` reports** (status + init share one rubric)
- [ ] agent-ui-cli.8 `fix` / no-arg default — bare `vllnt-ui` auto-detects + runs `gate`
- [ ] agent-ui-cli.10 `status` — readiness checklist: per-row status (✔ / ⚠ / ✖) + the fix command per row + a weighted (blocking-first) score; `--json` is the delegation artifact an agent works to green
- [ ] agent-ui-cli.11 Readiness rubric — the canonical capability list (foundation · quality gate · drift/automation · CI/release · agent surface) that `status` and `init` both read; every row maps to a real failure mode + a real `init` fix (no fix → not a row)
- [ ] agent-ui-cli.15 Package plumbing — stand up `@vllnt/ui-cli` as its own published package (esbuild bundle · own version line · CI build/test · changesets canary/stable), the **template** `front-studio` / `ui-toolbar` / `ui-native` reuse (extends `release-pipeline`, which is `@vllnt/ui`-only)
- [ ] agent-ui-cli.9 Validate MVP gate + onboarding loop (see Exit criteria): `status` on a bare consumer → `init` → re-`status` reaches 100% ✔, then `gate` holds it (E2E)

## studio [PLANNED]

**Goal:** One command — `vllnt-ui studio` — spawns **`@vllnt/front-studio`**, the frontend **workspace** that **wraps the running app** (same-origin, real live UI) and serves three modes: **Catalog** (auto-load + organize every component — Storybook-replace-or-together), **Review** (live per-lens scores — design-system · a11y · perf · network · console · responsiveness · visual — + the review loop), **Author** (capture a dev-intent → an LLM implements it via the CLI/API → the component updates live). Designer-usable, bypassing Figma for design-system work. Web now; mobile later (via `native-parity` + device runners).
**Exit criteria:** `vllnt-ui studio` on a sample consumer boots a local dashboard that embeds the live app, auto-discovers targets (Storybook/Ladle stories if present + site routes, sampled dynamic), and per target streams a **live score (0–100) per lens** — design-system drift, axe a11y, Lighthouse perf/CWV, network failures, console errors, responsiveness across viewports, visual diff + CV layout flags — plus an aggregate frontend-health score; exports identically as `--json` / MCP.
**Verify:** a dev runs `vllnt-ui studio` on a running app → the dashboard embeds the live app, auto-loads stories, crawls routes, and shows per-lens live scores; a deliberately broken layout (overflowing button + off-token color) drops the design-system + visual scores and is CV-flagged with a bbox on the real UI, while a failing request drops the network score; `--json` carries the same for an agent. Personas: dev (live dashboard), agent (`--json` / MCP), maintainer (baseline approve).

**Gated by:** `agent-ui-cli` (the API model, `studio.11`) shipping + a real need — **Horizon**. `review-loop`, `authoring-loop`, and `studio-hub` are each gated on this phase.

A whole-frontend studio, not a design-system checker — but **design-system is the lens only we can own** (rendered-vs-`tokens.json`, 16-preset/native awareness); the rest **wrap** what exists (Chrome DevTools MCP for network+console, Lighthouse for perf+a11y+scoring, Playwright for responsiveness, unlighthouse for the crawl+shell). Positioning stays "the frontend studio for teams on a design system" — the DS lens + the `review-loop` + local-first are the reasons to use it over raw DevTools/Lighthouse. Studio **hosts the app itself** (same-origin dev proxy → inject the Toolbar, or a webview/dev-browser — never a cross-origin iframe, which blocks element-select's DOM access; this is why stagewise went browser-ward). Heavy + opt-in — never the fast `gate`. CV is **pre-triage that shrinks the human queue, never an auto-blocker** until precision is proven; route sampling + dynamic masking keep whole-site diff from drowning in false positives.

- [ ] studio.1 `studio` shell — CLI spawns `@vllnt/front-studio`, a local web app that **wraps the running app** (same-origin dev proxy → inject the Toolbar; or webview/dev-browser) so review is on the live app, not screenshots (wrap unlighthouse crawl + dashboard shell)
- [ ] studio.10 Remote / headless serving — configurable `--host` / `--port`, fully headless (no local display assumed), and exposable through a reverse proxy or tunnel (e.g. `tailscale serve`): preserves same-origin for the Toolbar, honors base-path + forwarded host headers, WebSocket for live streaming; runs on a remote dev host, opened from any browser on the network
- [ ] studio.11 front-studio API contract (define first) — REST + WebSocket (`/stream`, live scores) + MCP as thin adapters over one core handler set; the dashboard, CLI (`--json`), and agents are all clients of it
- [ ] studio.2 Target auto-discovery — detect **Storybook/Ladle stories** if present (`.storybook`, `*.stories.tsx` → story index) + site routes (sitemap/links) + dynamic-route sampling; each story/route/screen is a target
- [ ] studio.12 Catalog mode — auto-load + organize every component (by the 12-family taxonomy from `component-sidebar`), designer-facing browse + live preview; works **with** Storybook (auto-loads its stories) or **as** a Storybook replacement (the workshop itself)
- [ ] studio.3 Design-system lens (OWNED — the moat) — rendered-vs-`tokens.json` intent · token/theme/contrast drift (16 presets × mode) · component-usage drift (via codebase-intelligence)
- [ ] studio.8 Runtime lenses (wrap) — a11y (axe) · perf/CWV (Lighthouse) · network + console (Chrome DevTools MCP: requests/failures/waterfall, errors/hydration) · responsiveness (Playwright viewport matrix; Maestro/device = mobile, later)
- [ ] studio.13 Tracing (outside-first, opt-in-deep) — **client** via CDP (Chrome DevTools MCP, zero app changes) + **server** via Next `instrumentation.ts` + OTel (`@vercel/otel` or raw `@opentelemetry/sdk-node` → OTLP) posting to studio's own collector; correlate by trace id into end-to-end traces (click → RSC → fetch). Scaffolded by `init`, **dev-only / prod-guarded**; `next.config` untouched except an optional `withVllntStudio` build-stats wrapper. Framework-agnostic (CDP = any web app; OTel = any server)
- [ ] studio.4 Visual diff — screenshot per target × viewport × theme vs baseline (wrap Playwright `toHaveScreenshot` / Argos); baseline approve + manage; dynamic-region masking
- [ ] studio.5 CV pre-triage — VLM (Claude vision) rubric pass + layout-semantic diff flag overflow/overlap/truncation/misalignment/low-contrast with bbox + confidence + reason
- [ ] studio.9 Live scoring — per-lens 0–100 + aggregate frontend-health, streamed live to the dashboard as targets are crawled
- [ ] studio.6 `--json` / MCP export — the full per-target, per-lens report as the agent-facing artifact (shared with `review-loop`)
- [ ] studio.7 Validate studio.1–6, .8–.13: `vllnt-ui studio` on a headless remote host, exposed via reverse proxy / tunnel, embeds the live app, auto-loads stories, crawls routes, streams per-lens live scores to a browser over the tunnel; a broken layout drops DS + visual and is CV-flagged, a failing request drops network; dashboard and `--json` match (E2E)

## review-loop [PLANNED]

**Goal:** A human triages UI changes in seconds and a coding agent (Claude Code / Codex) retrieves the structured, component-anchored feedback and fixes it — via a Tinder-style approve/reject, a configurable **Toolbar** (the in-app review overlay) **on the live app studio hosts**, and a shared review artifact + MCP.
**Exit criteria:** In `studio` a reviewer approves/rejects each diff (keyboard/swipe) and rejects with a message + tag; the overlay on the embedded live app lets them select an element → resolves to its @vllnt component + registry item + token + file, and comment/annotate/screenshot it; every rejection/annotation writes `.vllnt/review/*.json` and is exposed over MCP (`list`/`get`/`resolve`) so Claude Code/Codex retrieve + resolve it; a fix re-renders and auto-marks the item resolved.
**Verify:** a reviewer rejects a button diff with "wrong-token" + a note and annotates it by clicking the element on the live app (overlay shows `Button variant · registry item · --primary · Button.tsx`); Claude Code reads the review artifact over MCP, fixes the token, and the item flips to resolved on re-render. Personas: reviewer (overlay + Tinder triage), coding agent (MCP retrieve/resolve), maintainer (configures which HUD widgets show).

Runs on the app `studio` hosts (same-origin → the overlay can read the DOM for element-select). The differentiator is **element-select → @vllnt identity**: stagewise / Vercel Comments see anonymous DOM; we resolve component + token + registry item + blast-radius (via codebase-intelligence). Wrap stagewise's OSS toolbar + Velt / `@vercel/toolbar` comment primitive + a VLM; OWN the @vllnt-aware mapping, the versioned artifact contract, and the MCP bridge. Local-first / sovereign — the artifact is a local file, no SaaS. Build the **artifact + MCP bridge first** (smallest, highest-leverage, pure-owned); the overlay + Tinder plug into it.

- [ ] review-loop.1 Decide: how studio hosts the app for a DOM-accessible overlay — same-origin dev proxy (inject HUD) vs webview/dev-browser (stagewise's path); never a cross-origin iframe
- [ ] review-loop.2 Review artifact contract — versioned `.vllnt/review/*.json` (`component` · `registryRef` · `selector` · `file` · `screenshot` · `token` · `annotation` · `rejectionTag` · `suggestedFix`): the human↔agent hand-off
- [ ] review-loop.3 Agent bridge — `vllnt-ui review` MCP (`list` / `get` / `resolve`) so Claude Code / Codex retrieve open items + post status back; round-trip closes on re-render
- [ ] review-loop.4 Tinder triage — keyboard/swipe approve/reject per diff grouped by component/family; reject-with-message + quick-tags (contrast · spacing · wrong-token · layout-break · off-brand); CV pre-labels the queue
- [ ] review-loop.5 Configurable **Toolbar** (the in-app review overlay) — toggleable, `vllnt.config`-driven widget set (comment · screenshot · annotate/draw · measure · token-inspector · a11y-inspector · grid); wrap Velt / `@vercel/toolbar`; ships as a **standalone package importable into any app** (works without studio), and studio injects the same package when hosting
- [ ] review-loop.8 Toolbar API — browser SDK (`mountToolbar`) + local `/review` endpoint + MCP, all thin adapters over the artifact contract (`review-loop.2`); standalone (posts to its own endpoint) or studio-hosted (same contract)
- [ ] review-loop.6 Element-select → @vllnt identity — selecting on the live app resolves component + registry item + token + props + file + scoped `context` / blast-radius (via codebase-intelligence)
- [ ] review-loop.7 Validate review-loop.2–6, .8: a reviewer rejects + annotates a button via the overlay → artifact written → Claude Code reads it over MCP, fixes the token, the item auto-resolves on re-render (E2E, real agent)

## authoring-loop [PLANNED]

**Goal:** From studio, capture a **dev-intent** (create a component, or change one) as a structured artifact an LLM reads via the CLI / API / MCP and implements in real code; the new/updated component hot-reloads live in studio. Design-in-the-real-thing — the agent writes the code, studio captures intent + previews the result; no Figma, no code editor.
**Exit criteria:** In studio a user (no code) describes a create-intent (e.g. "`PricingToggle`, variants monthly/annual, on `--primary`") → written as `.vllnt/intent/*.json` + exposed over MCP → a coding agent implements it (component + story + registry item via `registry:build`) → studio hot-reloads and shows it live in the catalog, correctly themed; a change-intent on an existing component updates it live.
**Verify:** a designer describes a component in studio → an agent implements it → it appears live in the catalog + registry with a story, on-token; a change-intent ("match padding to `--space-4`") updates the real component live. Personas: designer (intent, no code), coding agent (implements via CLI/API), maintainer (reviews the generated component via `review-loop`).

The **create** twin of `review-loop` — both are intent → agent → live over the same API + artifact contract (the intent artifact is a sibling of the review artifact). Studio captures intent + previews; the LLM writes code via the CLI/API/agent bridge; `registry:build` regenerates the item + story. OWN the intent schema + the compose-from-@vllnt/ui scaffolding; wrap the codegen agent (Claude Code / Codex). Keep studio thin — it never edits code or draws vectors. Bypasses Figma for design-system work; creative/vector authoring stays in Figma / `stitch` / `pencil` (integrated as inputs).

- [ ] authoring-loop.1 Dev-intent schema + MCP — `.vllnt/intent/*.json` (`create`|`change` · target/name · variants · tokens · props · behavior · reference) + MCP (`intent.create` / `get` / `resolve`); the design↔agent contract
- [ ] authoring-loop.2 Intent capture in studio — designer-facing, no-code: describe / create a component or change one (compose from @vllnt/ui + tokens), writes an intent
- [ ] authoring-loop.3 Agent implement — CLI/API hands the intent to a coding agent (Claude Code / Codex) that writes the component + story + registry item (`registry:build`) and posts status back
- [ ] authoring-loop.4 Live update — studio hot-reloads the new/changed component into the catalog on implement (HMR + registry rebuild)
- [ ] authoring-loop.5 Validate authoring-loop.1–4: a no-code create-intent → agent implements → component appears live in catalog + registry, themed, with a story; a change-intent updates live (E2E, real agent)

## studio-hub [PLANNED]

**Goal:** One local studio instance is a **hub** any app registers to — dozens of worktrees (same app, many ports) or multiple projects — where a human and many agents (dev + review) work in parallel, every target isolated.
**Exit criteria:** N running apps register to one `vllnt-ui studio` (`POST /apps` with url/port + worktree/branch + project); the dashboard lists + switches + compares targets; per-target scores / findings / review-artifacts / intents are namespaced by worktree/branch/project; multiple agents (dev implementing, review verifying) operate concurrently over API/MCP with no cross-contamination.
**Verify:** two worktrees of one app on ports A/B + a second project all register to one studio; a dev agent implements an intent in worktree A while a review agent verifies worktree B — both live in the same dashboard, artifacts isolated per worktree; a human requests a change on project 2 untouched by either. Personas: dev (local dashboard), dev agents (parallel, headless, implement), review agents (parallel, verify / request-changes), across worktrees + projects.

Falls out of API-first (`studio.11`) — registration is just another API — plus the repo's worktree-first workflow. One instance holds a live target registry keyed by worktree/branch/project; every artifact (scores, review `review-loop.2`, intent `authoring-loop.1`) is namespaced per target so parallel work never collides. Roles (dev / review) are just API/MCP clients; studio coordinates via the shared artifacts, no lock-step. Headless (`studio.10`) so agents drive it; humans open the dashboard when they want. **Not a general agent orchestrator** — the hub is frontend-evaluation-specific (register · score · review · author per target); crawl/CV run **per target on demand**, not all N continuously (resource guard).

- [ ] studio-hub.1 App registration API — `POST /apps` (url/port + worktree/branch + project) + heartbeat / deregister; a live target registry (one studio, many apps)
- [ ] studio-hub.2 Per-target isolation — namespace scores / findings / review artifacts / intents by worktree/branch/project; parallel targets never cross-contaminate; crawl/CV per target on demand
- [ ] studio-hub.3 Multi-target dashboard — list / switch / compare registered apps; per-target status + worktree/branch/project labels
- [ ] studio-hub.4 Multi-agent, multi-role — concurrent dev + review agents over API/MCP; role-scoped tools (dev → implement intents; review → verify / score / request-changes); no lock-step, the artifacts arbitrate
- [ ] studio-hub.5 Worktree awareness — attribute every artifact to its worktree/branch; register-on-launch from a worktree's dev server (`vllnt-ui studio --register`)
- [ ] studio-hub.6 Validate studio-hub.1–5: two worktrees (same app, ports A/B) + a 2nd project register to one studio; a dev agent authors in A while a review agent verifies B concurrently, artifacts isolated; the dashboard shows all three (E2E, real agents)

## search-consolidation [PLANNED]

**Goal:** Stop the silent ranking leaks — kill the dead-domain cannibalization and fix the canonical / schema / analytics gaps capping the already-indexed pages.
**Exit criteria:** `ui.vllnt.com/*` 301s to `ui.vllnt.ai/*`; GSC shows `.com` pages dropping and `.ai` positions rising; every localized page self-canonicals to its resolved (non-307) URL; zero console errors on load; Rich Results clean for BreadcrumbList + SoftwareApplication.
**Verify:** a visitor landing on a stale `ui.vllnt.com/components/*` URL is 301'd to the live `.ai` page; Google Rich Results Test passes on `/components/[slug]` (Breadcrumb) and `/` (SoftwareApplication); DevTools console is clean on `/` + `/components/[slug]`. Personas: search visitor on a stale URL; Googlebot recrawling duplicates.

- [ ] search-consolidation.1 301-redirect all `ui.vllnt.com/*` → `ui.vllnt.ai/*` at the host/DNS edge (restore the subdomain only to serve the redirect) (cmd: `curl -sI https://ui.vllnt.com/components/calendar | grep -Ei '301|location: https://ui.vllnt.ai'`)
- [ ] search-consolidation.2 Self-referencing canonical + hreflang per locale in `apps/registry/app/[locale]/layout.tsx` + `lib/seo.ts` — canonical targets the resolved URL, not the 307 (cmd: `curl -s https://ui.vllnt.ai/components/button | grep -c 'rel="canonical".*/components/button'`)
- [ ] search-consolidation.3 Replace the `@vercel/analytics` + `@vercel/speed-insights` 404s in `layout.tsx` with a portable web-vitals beacon (cmd: agent-browser `/` → 0 console errors, no `/_vercel/insights` 404)
- [ ] search-consolidation.4 Add `BreadcrumbList` JSON-LD to `/components/[slug]` + `/docs/[slug]`, `SoftwareApplication` `featureList` on `/`, and a `blogPostingLd()` helper in `lib/jsonld.ts` (cmd: Rich Results Test clean on `/components/button`)
- [ ] search-consolidation.5 Exclude 307/redirecting locale URLs from `sitemap.ts` + request re-index of the AI-wedge pages in GSC (cmd: `python3 gsc.py query --site sc-domain:ui.vllnt.ai --dimensions page --filter 'page contains /components/ai-'`)
- [ ] search-consolidation.6 Validate search-consolidation.1–5: E2E — stale `.com` URL 301s to `.ai`; Rich Results clean (Breadcrumb + SoftwareApplication); console clean; canonical resolves (E2E: `pnpm test:e2e seo-consolidation`)

## ai-toolchain-registration [PLANNED]

**Goal:** Make VLLNT UI installable by name inside AI coding tools — register the registry, MCP server, and docs in the indexes agents actually query. Highest-ROI, do-first (converts the DONE `agent-surface` infra into installs).
**Exit criteria:** `@vllnt` resolves in `ui.shadcn.com/r/registries.json`; a shadcn-MCP-connected agent installs `@vllnt/ai-chat-input` by name; Context7 serves `ui.vllnt.ai` docs; `@vllnt/mcp` is on npm + the official MCP Registry; the GitHub repo carries the AI topics.
**Verify:** in a fresh app with `"@vllnt": "https://ui.vllnt.ai/r/{name}"` in `components.json`, an agent prompted "add an AI chat thread" installs a VLLNT component; Context7 returns VLLNT docs for a Cursor query. Personas: dev scaffolding in Cursor/Claude Code/v0; agent resolving a component by name.

- [ ] ai-toolchain-registration.1 PR `@vllnt` into the shadcn registry directory (`apps/v4/registry/directory.json`) + verify the earlier index PR is live in `registries.json` (cmd: `curl -s https://ui.shadcn.com/r/registries.json | grep -c '@vllnt'`)
- [ ] ai-toolchain-registration.2 Submit `ui.vllnt.ai` to Context7 + add `context7.json` to repo root (cmd: `curl -s https://context7.com/vllnt/ui | grep -ci vllnt`)
- [ ] ai-toolchain-registration.3 Publish a distributable `@vllnt/mcp` stdio bridge (wrapping the hosted `/mcp`) to npm (cmd: `npm view @vllnt/mcp version`)
- [ ] ai-toolchain-registration.4 Register the MCP server in the official MCP Registry (`mcp-publisher`) + Registry Discovery MCP (cmd: `curl -s https://registry.modelcontextprotocol.io/v0/servers | grep -ci vllnt`)
- [ ] ai-toolchain-registration.5 Add GitHub topics `ai, ai-agents, llm, generative-ui, shadcn, shadcn-registry` + document the `components.json` `@vllnt` snippet in `/docs/installation` (cmd: `gh repo view vllnt/ui --json repositoryTopics | grep -E 'ai-agents|shadcn-registry'`)
- [ ] ai-toolchain-registration.6 Validate ai-toolchain-registration.1–5: E2E — in a scratch app with the `@vllnt` namespace, `npx shadcn add @vllnt/ai-chat-input` resolves + installs; MCP `tools/call search_components` returns hits (E2E: `pnpm test:e2e registry-install`)

## visibility-measurement [PLANNED]

**Goal:** Instrument human + AI-agent traffic and share-of-voice before investing in content, so every later phase is judged on real signal. Stand up first-week even though sequenced here.
**Exit criteria:** GA4 shows an "AI Assistant" channel with sessions; a SOV tracker reports VLLNT mention-rate across "best AI UI" prompts; server logs surface GPTBot/ClaudeBot/Claude-Code fetches; a scheduled GSC review runs.
**Verify:** N/A — ops/config phase (dashboards + scripts, no app-code surface); each task carries its own runnable check. Persona served: maintainer reading the weekly visibility report.

- [ ] visibility-measurement.1 Configure the GA4 AI-Assistant channel + a referrer/UTM filter `chatgpt.com|perplexity.ai|claude.ai|gemini.google.com|copilot.microsoft.com` (cmd: GA4 realtime shows the channel on a test referral)
- [ ] visibility-measurement.2 Stand up a share-of-voice tracker (Profound/Otterly/Peec/Ahrefs Brand Radar) on the AI-UI prompt set (cmd: tracker dashboard returns a baseline mention rate)
- [ ] visibility-measurement.3 Add server-log crawler monitoring for GPTBot/ClaudeBot/Claude-Code/PerplexityBot/OAI-SearchBot — proves llms.txt consumption (cmd: `grep -Ec 'GPTBot|ClaudeBot|Claude-Code' access.log`)
- [ ] visibility-measurement.4 Script a recurring GSC position/impressions review via `gsc.py` (cmd: `python3 gsc.py query --site sc-domain:ui.vllnt.ai --dimensions query --days 28`)

## seo-content-engine [PLANNED]

**Goal:** Build the content flywheel — an MDX blog plus programmatic integration / alternative / comparison pages that capture long-tail install intent and definitional AI-wedge queries.
**Exit criteria:** `/blog` + `/blog/[slug]` render MDX posts with BlogPosting JSON-LD, Shiki highlighting, per-post OG + RSS; `/integrations/{tool}` + `/alternatives/{competitor}` pages ship and are in the sitemap; 3 flagship guides live; each `/components/[slug]` has unique copy + live demo + install command.
**Verify:** a dev searching "how to build a chat ui with the vercel ai sdk" finds a VLLNT guide; `/alternatives/assistant-ui` renders a comparison table; a blog post shows correct BlogPosting rich data. Personas: dev in organic search; dev comparing libraries; AI answer engine extracting a table. (needs: search-consolidation done first)

- [ ] seo-content-engine.1 Add the MDX blog: `content/blog/{slug}/{locale}.mdx` + `lib/blog.ts` (Content Collections `@content-collections/mdx`, Zod frontmatter — NOT Contentlayer; Velite fallback) mirroring `lib/content.ts` (needs: search-consolidation.4) → docs/specs/blog-system.md
- [ ] seo-content-engine.2 Routes `/blog` + `/blog/[slug]` with `generateMetadata` + BlogPosting/Breadcrumb JSON-LD + Shiki build-time highlighting + per-post OG via `ImageResponse` (cmd: `curl -s https://ui.vllnt.ai/blog/<post> | grep -c '"@type":"BlogPosting"'`)
- [ ] seo-content-engine.3 Blog RSS + sitemap + llms.txt entries (extend `app/rss.xml`, `sitemap.ts`, `llms.txt/route.ts`) (cmd: `curl -s https://ui.vllnt.ai/sitemap.xml | grep -c /blog/`)
- [ ] seo-content-engine.4 Programmatic `/integrations/{tool}` pages (vercel-ai-sdk, langgraph, convex, openai, anthropic), data-driven like `lib/use-cases.ts` (cmd: `curl -sI https://ui.vllnt.ai/integrations/vercel-ai-sdk | grep -c 200`)
- [ ] seo-content-engine.5 Programmatic `/alternatives/{competitor}` pages (assistant-ui, copilotkit, ai-elements) with a comparison table + FAQPage LD (cmd: `curl -s https://ui.vllnt.ai/alternatives/assistant-ui | grep -c '<table'`)
- [ ] seo-content-engine.6 Per-component uniqueness pass: unique copy + live demo + install command on each `/components/[slug]` → docs/specs/component-page-uniqueness.md
- [ ] seo-content-engine.7 Publish 3 flagship guides (best react components for AI agents; assistant-ui vs ai-elements vs vllnt; render tool calls in react) — answer-first, stats + tables, TechArticle LD (cmd: `curl -s https://ui.vllnt.ai/blog/best-react-components-for-ai-agents | grep -c '<table'`)
- [ ] seo-content-engine.8 Validate seo-content-engine.1–7: E2E — blog post renders with BlogPosting rich data; integration + alternative pages return 200 with tables; component page shows demo + install; RSS/sitemap include blog (E2E: `pnpm test:e2e content-engine`)

## backlink-authority [PLANNED]

**Goal:** Manufacture the off-domain gravity — the referring domains and brand mentions that lift rankings and feed AI recall — from zero.
**Exit criteria:** VLLNT is listed in ≥5 awesome-lists/directories; a Show HN + Product Hunt launch shipped; ≥3 syndicated posts with canonical-home; one original-data link magnet published and earning links.
**Verify:** a target awesome-list README shows the VLLNT entry; the GSC Links report shows ≥3 external referring domains to the magnet. Personas: dev discovering VLLNT via a listicle/HN; author citing the benchmark. (needs: seo-content-engine for the syndicated posts + magnet)

- [ ] backlink-authority.1 PRs to awesome-shadcn-ui + awesome-react-components + awesome-nextjs + awesome-generative-ui (cmd: PR merged + entry visible in the list README)
- [ ] backlink-authority.2 Show HN launch + Product Hunt launch (cmd: live HN + PH post URLs)
- [ ] backlink-authority.3 Submit to OSS aggregators: OpenAlternative, LibHunt, AlternativeTo, SaaSHub, DevHunt (cmd: listing URLs live)
- [ ] backlink-authority.4 Syndicate 3 guides to dev.to/Hashnode with `canonical` → ui.vllnt.ai (needs: seo-content-engine.7) (cmd: syndicated post `rel=canonical` points home)
- [ ] backlink-authority.5 Newsletter sponsorship (React Status / Bytes / JS Weekly) timed to the magnet (cmd: placement confirmed live)
- [ ] backlink-authority.6 Ship one original-data link magnet: AI chat UI benchmark or "State of AI UI 2026" survey (needs: seo-content-engine.1) → docs/specs/link-magnet.md
- [ ] backlink-authority.7 Validate backlink-authority.1–6: GSC Links report shows ≥3 new referring domains to the magnet + ≥5 directory/list entries live (cmd: `python3 gsc.py query --site sc-domain:ui.vllnt.ai --dimensions page --filter 'page contains /blog/'` + GSC Links export)

---

## Later

Unscheduled — pull into a phase when prioritized.

- **react-doctor-90** — push score 71 → 90 (sweep issues closed but target not fully met; see `codebase-health` caveat).
- **ai-elements-voice** (6) — AudioPlayer, MicSelector, Persona, SpeechInput, Transcription, VoiceSelector.
- **ai-elements-ide** (9) — Commit, EnvironmentVariables, FileTree, PackageInfo, SchemaDisplay, Snippet, StackTrace, Terminal, TestResults.
- **ai-elements-canvas** (5) — Canvas, Connection, Controls, Node, Panel (verify against existing `@xyflow`-based components first).
- **agent-ui-cli-v1** — config bundle, `doctor` wrapper, `add`, `ci` reusable workflow (+ `act` for local==CI), `list`/`info`/`why`/`search`, `vllnt.config`, `upgrade`; **drift gates** — `api-extractor` (public-API `.api.md` diff), `dependency-cruiser` (import boundaries across 309 components), `sherif` (dep-version drift); **test** — wrap Storybook 10 `addon-vitest` (interaction + a11y + coverage via Vitest browser mode), don't rebuild; **dual-primitive** — `context`/`check` handle `--base radix|base-ui` (Base UI ascendant, Radix at plateau).
- **agent-ui-cli-v2** — `audit` (knip + size-limit + dependency-cruiser graph), baseline gating, i18n lint, client security, `new`/scaffold, `theme new`/`edit`, `remove`/`diff`, `watch`/`report`. (Whole-site `audit --browser` + visual regression are now the **`studio`** phase; the human↔agent review loop is **`review-loop`**. Chrome DevTools MCP + Playwright MCP feed both.)
- **docs + search** — `/docs` expansion (#248), Pagefind full-text (#257), Sandpack playground (#256), `/vs` pages (#258), `/templates` (#259), i18n via next-intl (#281).

---

## Appendix — agent-ui-cli full spec

Preserved design detail for the `agent-ui-cli` phase. Harness-agnostic CLI that ships the @vllnt design-system **agent contract** (rules + tokens + component index) and a **standardized client-side gate** that runs identically locally and in CI. Orchestrates wrappable OSS tools (eslint / stylelint / knip / size-limit / playwright); hand-writes the checks no OSS tool covers — chief among them **design-token correctness + coherence**: `tokens.json` is the single source of truth, and every CSS var, theme preset, and Tailwind value must derive from it without drift.

### Tooling selection (researched 2026-07 — verified live: npm + GitHub)

Principle confirmed by a 6-stream sweep of the 2026 front-end/DX + shadcn ecosystem: **orchestrate best-in-class OSS; hand-write only the ~6 gaps nothing covers.** `react-doctor` is one wrapped tool among ~18, not the center.

**WRAP — one pick per slot:**

| Slot | Wrap | Skip / why |
|---|---|---|
| Semantic + a11y lint | ESLint 10 + `react-hooks` + `jsx-a11y` (v10 ships `@eslint/mcp`) | full `eslint-plugin-react` (dead under new JSX) |
| Fast format + lint | Biome v2 (type-aware, no tsc) — or oxlint for speed | don't run both; Ultracite = mine its ruleset (it wraps Biome) |
| Tailwind v4 classes | `eslint-plugin-better-tailwindcss` or Biome sort | francoismassart plugin (v4 support partial) |
| Dead code / deps | knip | ts-prune / unimported / depcheck (knip supersets all) |
| Import boundaries | dependency-cruiser (`--validate`) | madge (subset) |
| Code graph / impact / blast-radius | **codebase-intelligence** (owned; used *by* the CLI, not a second tool) | CI can displace knip/dependency-cruiser for the graph — open decision |
| Publish correctness | publint + `@arethetypeswrong/cli` | — |
| Bundle budgets | size-limit (+ `size-limit-action` PR diff) | bundlewatch, source-map-explorer (stale 2022) |
| Component test / a11y / interaction / coverage | Storybook 10 + `@storybook/addon-vitest` (Vitest browser mode, axe inline) | `@storybook/test-runner` (superseded), histoire (stalled) |
| Token transform + lint | Style Dictionary (DTCG) + Terrazzo (OKLCH gamut + single-pair contrast) | — |
| Contrast math | colorjs.io (WCAG + native APCA) or culori (light, WCAG-only) | — |
| Visual regression | Playwright `toHaveScreenshot` on a pinned Docker runner (free; owns 309 × 16-theme) — Chromatic (~$179/mo) if hosted review | **Lost Pixel — archived Apr 2026, avoid** |
| Perf / CWV | unlighthouse (site-wide crawl + budget) + web-vitals | @lhci/cli (aging) |
| Public-API drift | api-extractor (committed `.api.md` diffed in CI) | — |
| Dep-version drift | sherif (Rust, fast) or syncpack | manypkg (slow cadence) |
| Release (canary / stable) | changesets (matches our channel model) | release-please / semantic-release (never run two) |
| CI parity + PR chores | reusable workflows + Turborepo (+ self-hosted remote cache) + act (local==CI) + Danger JS | Nx Cloud (turbo stack) |
| Agent-native audit | Chrome DevTools MCP (observe: perf/CWV) + Playwright MCP (act: a11y-tree) | design-to-code (still hype) |
| Install over registry | shadcn CLI v4 + its registry MCP (already does namespaced/private/GitHub registries + auth) | rebuilding any of it |

**OWN — the moat (no OSS tool covers these; this is the react-doctor-class value):**

1. **Token 3-way drift** — `tokens.json ↔ CSS vars ↔ Tailwind preset` sync (Terrazzo / Style Dictionary catch only *unresolvable* refs, never drift; catches the recorded registry-`tailwind.config` desync).
2. **16-preset × light/dark contrast sweep** — auto-enumerate *every* semantic fg/bg pair and assert WCAG/APCA (Terrazzo lints only manually-listed pairs); wrap colorjs.io for the math, own the sweep.
3. **OKLCH gamut + sRGB/HSL fallback codegen** for the native target (NativeWind v4 has no on-device `oklch()`).
4. **Cross-platform web↔native registry resolution** — shadcn gives *zero* native semantics; entirely our layer (see `native-parity`).
5. **reduced-motion lint** — enforce `prefers-reduced-motion` in JS/Framer (unlinted today).
6. **Per-artifact `--check` drift wiring** — there is **no general drift-detector**; the universal mechanism is `generate → diff committed → fail`. Own registry↔source + tokens↔tailwind (no off-the-shelf checker); wrap the ready-made ones (api-extractor, attw, syncpack).

**Plan around (shadcn ecosystem shifts, 2026):**

- Primitive base is now **pluggable and tilting to Base UI** (`shadcn init --base radix|base-ui`; Base UI 1.0 Dec-2025 → 1.6; Radix at a maintenance plateau under WorkOS). Components + registry must support **both backends**, lean Base UI-forward. Neither primitive solves native.
- shadcn CLI v4 **already ships** namespaced/private/GitHub registries + auth, a registry **MCP** server, `init` templates/`--preset`, and `registry include`/`validate` — do **not** rebuild these; wrap/extend.
- Storybook 10 **owns** component test / a11y / interaction / coverage via `addon-vitest` — orchestrate it, never rebuild the harness.
- Tailwind v4 + React 19 are the **settled baseline** (blank `tailwind.config`; author ref-as-prop, drop `forwardRef`; style `new-york`, `default` deprecated).
- shadcn is **climbing into DX/agent space** (`@shadcn/react` headless pkg v0.2, `shadcn/skills` agent context) — a moving upstream to track.

### Onboarding: `status → init → gate`

The adoption surface — one CLI turns "is this project frontend-ready on @vllnt?" into a self-verifying loop, so the standard can be **delegated** to a human or an agent without transferring the standard itself.

- `status` reports the readiness rubric with per-row status + fix command (`--json` = the hand-off artifact); `init` scaffolds every ✖; `gate` holds it. `status` is the *map*, `init` the *paver*, `gate` the *guardrail* — all reading one rubric.
- **Delegation loop:** `status --json` → agent/dev works the ✖/⚠ rows (each names its own fix) → re-`status` until 100% ✔. The checklist **is** the standard, self-verifying — the delegate never needs to know the standard.
- Score is **blocking-weighted, not equal-weighted** — a failed contrast / token-drift / native-parity row flags RED and caps the score regardless of %; `gate` (not the score) is the real pass/fail. The checklist informs, the gate decides — this is the guard against readiness-theater.
- **One entry point: humans and agents both invoke `vllnt-ui`** (CLI for humans, `--json`/MCP for agents) — no second tool to learn. **codebase-intelligence is used *by* the CLI**, not alongside it — an internal orchestrated dependency (same tier as eslint/biome), the code-graph provider. The CLI drives its index; impact/blast-radius surfaces inside `vllnt-ui` output (`upgrade`/`check`/`status`). Opt-in + heavy (TS-only, indexes the repo), so it never gates the fast path; core `status`/`gate` run without it.

**Readiness rubric (v1):**

| Group | Rows (each renders status ✔/⚠/✖ + a fix command) |
|---|---|
| Foundation | @vllnt/ui installed + current · tailwind preset wired · tokens single-source · theme contrast (16 presets × light/dark) · web↔native parity |
| Quality gate | eslint (react-hooks + jsx-a11y) · format (biome) · typecheck · component tests (Storybook `addon-vitest`) · bundle budgets (size-limit) |
| Drift / automation | public-API (api-extractor) · dep-version (sherif) · token↔tailwind (owned) · reduced-motion (owned) · pre-commit calls `gate` |
| CI / release | CI calls `vllnt-ui gate` · local==CI (act) · release channel (changesets) |
| Agent surface | `context` payload emitted · code-graph index built (CLI-managed via codebase-intelligence → impact/blast-radius) |

Prior art to reuse, not reinvent: **expo-doctor** (closest analog) and the in-house `iris` / `oss-readiness` / `prepare-github-repository` skills — checklist + status + scaffold engine, same shape, new (frontend/design-system) rubric.

### `studio` + `review-loop` — prior art + wrap/own (researched 2026-07)

The "CLI spawns a local web app that crawls + verifies the whole site" pattern is proven; a design-system-aware human↔agent review loop on the *live* app is not yet owned by anyone.

- **Crawl + dashboard shell** → wrap **unlighthouse** (`--site` crawls every route, live local dashboard).
- **Host the live app** (for real-UI annotation + element-select) → same-origin **dev proxy** (inject HUD) or a webview/**dev-browser** like **stagewise** — *not* a cross-origin iframe (blocks the DOM access element-select needs).
- **Auto-load stories** → detect `.storybook` / `*.stories.tsx` (Storybook/Ladle) + read the story index; each story is a review target — the primary surface for a component library.
- **Visual diff / review UI** → wrap **Argos** (OSS, Playwright/Storybook) or **BackstopJS**; **Meticulous** (AI, session-recorded) for auto-coverage.
- **CV bug detection** → wrap a **VLM** (Claude vision, rubric-prompted) + **Applitools Eyes**-style layout-semantic diff (overflow/overlap/truncation/misalignment).
- **Select-element → agent** → wrap **stagewise** (OSS, DOM+screenshot→Cursor/Windsurf); **Onlook** is sandbox-only (misses real runtime). **Comment-on-preview** → **Velt** / **`@vercel/toolbar`**. **DS-usage drift** → **Omlet** (`@omlet/cli`) is the code-usage analog; we own *rendered* drift.
- **OWN throughout:** @vllnt-aware element→component/token/registry mapping · rendered-vs-token CV check · versioned review artifact · MCP agent bridge — none of the above is design-system-aware or local-first/sovereign.
- The overlay is the **vllnt Toolbar**. Vercel's Toolbar = human comments on anonymous DOM (cloud/SaaS); the vllnt Toolbar is design-system-typed (element → component / token / registry), agent-native (artifact + MCP → Claude Code/Codex), and local-first. Wrap **Velt / `@vercel/toolbar`** for the collab primitives; own the three columns they can't touch — typed elements, agent bridge, sovereignty.

Guards: CV ships as pre-triage, never an auto-blocker, until precision is proven; whole-site visual diff needs route sampling + dynamic masking or it drowns in false positives; overlay hosting must be DOM-accessible (proxy/browser, not iframe).

### Package graph & repo shape

All of it stays in **this pnpm+turbo monorepo** — every package derives from one source of truth (`tokens.json` + component source + registry), so a token/registry change ripples to CLI/native/studio/toolbar in atomic cross-package PRs. Monorepo ≠ lockstep: changesets versions each package independently (`@vllnt/ui` 0.4→1.0 while `@vllnt/ui-cli` runs 0.1+). Split to polyrepo only when a package earns a truly independent team/cadence/infra — extract-later is cheap, premature split is not.

| Package | Runtime / consumer | Weight |
|---|---|---|
| `@vllnt/ui` | browser · apps import | foundation (components + tokens) |
| `@vllnt/ui-native` | RN · apps import | native-parity twins |
| `@vllnt/ui-toolbar` | browser · app imports / studio injects | light runtime overlay (à la `@vercel/toolbar`) |
| `@vllnt/ui-cli` | node · terminal (`vllnt-ui`) | tiny — FAST install, esbuild bundle |
| `@vllnt/front-studio` | node + browser · lazily spawned by `vllnt-ui studio` | HEAVY (crawler · playwright · VLM · dashboard) |

**Composable + standalone.** `@vllnt/front-studio` and `@vllnt/ui-toolbar` each work **standalone** — the Toolbar drops into any app (like `@vercel/toolbar`) for in-app select / annotate / agent-handoff without studio; studio crawls + multi-lens-scores without the Toolbar. **Together**, studio hosts the app and injects the Toolbar for the full review loop. The only coupling seam is the **review artifact + MCP contract** (`review-loop.2/.3`) — neither package imports the other; both read/write the same artifact.

**Non-goal — not a vector canvas, not a code editor.** studio *does* author — but via structured **dev-intent** that an LLM implements in real code (`authoring-loop`), not vector drawing and not by embedding a code editor. It **bypasses Figma for design-system work** (compose / configure / create real components — design-as-code, as close to dev as possible), and keeps creative / brand / vector authoring in Figma / `stitch` / `pencil`, which studio **integrates as inputs** (generate → compose → verify; import frames as diff baselines). The agent writes the code; studio captures intent + previews the real result.

### Architecture — API-first

Each engine is **headless and API-first**: it exposes its capability as an API, and the CLI, the web dashboard, agents, and any other tool are **clients** — logic lives in the engine, never in a client. The API is the product; the dashboard / CLI / agent are interchangeable skins. This is what makes standalone + composable + remote (tunnel) + agent-native fall out for free.

- **`@vllnt/front-studio`** — REST (`/targets` · `/runs` · `/scores` · `/findings` · `/baseline`) + **WebSocket** (`/stream`, live per-lens scores) + **MCP**. `vllnt-ui studio` boots the service; the dashboard is a browser client; `--json` is a one-shot call; agents use MCP.
- **`@vllnt/ui-toolbar`** — browser SDK (`mountToolbar`) + a local `/review` endpoint + **MCP**, all over the shared review-artifact contract. Standalone → posts to its own endpoint; studio-hosted → posts to studio's, same contract.
- **Multi-target hub** — apps register via `POST /apps` (url/port + worktree/branch + project); one instance hosts many targets (dozens of worktrees / ports / projects), isolated per worktree, with a human + concurrent dev/review agents as clients (`studio-hub`).
- **Coupling** — only the review artifact + MCP contract (`review-loop.2/.3`); neither engine imports the other.

Disciplines (or API-first rots): **one core, many adapters** — REST / WS / MCP / `--json` are thin adapters over *one* handler set, never diverging APIs. **YAGNI the surface** — ship the minimal API a real client needs; grow it when a second client demands it. **Access boundary** — a service exposed over a tunnel leans on the tunnel's identity (ACL), not premature auth, but is never bind-all with no boundary.

| Ship | Item | Type | Scope |
|---|---|---|---|
| MVP | `context` | Feature | Emit rules + tokens + component index as JSON — agent loads before UI work |
| MVP | `check` | Feature | Static design-lint on *usage*: off-token color, missing `use client`, off-scale spacing; `--fix` |
| MVP | `tokens check` (L0, **owned**) | Feature | Token *system* correct + coherent: schema, scale order, ref resolution, `tokens.json` ↔ CSS ↔ Tailwind single-source sync, OKLCH gamut |
| MVP | `theme check` (L0, **owned**) | Feature | Perceptual: WCAG contrast + token-parity across all 16 presets × light/dark — no OSS tool does this |
| MVP | reduced-motion lint (L0, **owned**) | Feature | Enforce `prefers-reduced-motion` in JS/Framer (today: per-component, unlinted) |
| MVP | `gate` | Feature | Compose L0 + L1 (lint) + L2 (tsc); one verdict; `--staged` (pre-commit) / `--scope changed` (CI) |
| MVP | `init` / `sync` | Feature | Scaffold + version-pin the shared client-side config bundle into a consumer repo |
| MVP | `fix` / no-arg default | Feature | Single entry: bare `vllnt-ui` auto-detects + runs `gate`; `fix` runs every autofixer (eslint / stylelint / tokens / prettier-tw) |
| v1 | config bundle | Task | Extend `@vllnt/eslint-config`; add stylelint / knip / size-limit / playwright presets, pinned |
| v1 | `doctor` | Task | react-doctor wrapper — version-pinned + flag-normalized (insulates consumers from CLI drift) |
| v1 | `add` | Task | `shadcn add @vllnt/<c>` passthrough, registry URL pinned |
| v1 | `ci` + reusable workflow | Feature | `dx.yml` (on `workflow_call`); consumers reference `uses: vllnt/ui/...@v1` |
| v1 | `list` / `info` / `why` / `search` | Task | Granular context reads (props, a11y, examples, explain-finding) |
| v1 | `vllnt.config` | Task | Zod-schema config: budgets, enabled checks, theme list, framework, monorepo `--project`, per-repo overrides |
| v1 | `upgrade` | Feature | Bump `@vllnt/ui` + run codemods (e.g. React 19 ref-as-prop) + `sync` |
| v2 | `audit` (L3) | Feature | knip (dead code / exports / deps) + size-limit (per-component bundle budgets) |
| v2 | `audit --browser` (L4) | Feature | agent-browser: axe ×(light+dark), Web Vitals (LCP/INP/CLS), visual screenshots — budgets, ×N median |
| v2 | Baseline gating | Task | `@eslint/css use-baseline` for container queries / View Transitions / `@scope` |
| v2 | i18n lint | Task | Hardcoded-string + RTL / logical-props (aligns with when RTL support lands) |
| v2 | client security | Task | `no-unsanitized` + CSP scaffold + supply-chain scan (osv-scanner / Socket) |
| v2 | telemetry portability | Task | Flag platform-locked telemetry (`@vercel/analytics` 404s off-Vercel) → portable web-vitals beacon |
| v2 | `new` (scaffold) | Feature | Generate a component / page composed from @vllnt/ui — the generative half of "managing the client side" |
| v2 | `theme new` / `theme edit` | Feature | Author a brand preset with live contrast validation (design-system authoring, not just checking) |
| v2 | `remove` / `diff` | Task | Lifecycle: uninstall a component (+ orphaned deps); diff installed copy vs registry |
| v2 | `watch` / `report` | Task | Inner-loop re-check on save; compliance score over time vs baseline |

### Commands in detail

**Context** — read-only, `--json` default; source is local canonical in the monorepo, bundled-in-package + remote registry in a consumer repo.

- `context` — one payload an agent loads before any UI work: BLOCKING design rules + full token set (with resolved CSS-var names) + component index (name, category, stability, import, a11y, props summary).
- `list` / `info <c>` / `search <q>` — registry index / single-component detail (props, a11y, examples, deps) / fuzzy find.
- `why <file:line>` — passthrough to `react-doctor why`; explains a finding.

**Tokens & theme** — the design-token correctness + coherence core (L0, owned — no single OSS tool does this).

- `tokens` — emit resolved design tokens as JSON; `--group color|spacing|type|radius|elevation|motion`. The data feed for agents and the checks below.
- `tokens check` — assert the token *system* is correct and coherent:
  - **schema** — `tokens.json` valid against its `$schema` (DTCG).
  - **scale order** — spacing / type / radius / elevation scales monotonic, no dup or gap.
  - **reference integrity** — alias tokens resolve; no cycles, no dangling refs.
  - **single source of truth** — every CSS var in `themes/default.css` + `themes/presets.css` + the Tailwind preset derives from a token; flags inline redefinitions (e.g. the registry's own `tailwind.config`) and orphan tokens (defined, never emitted).
  - **gamut / format** — OKLCH channels parse and sit in valid range.
  - **naming** — CSS-var name matches the token path.
  - local: human report + `--fix` for mechanical issues (ordering, missing var); CI: `--json`, nonzero exit.
- `theme check` — perceptual coherence: every semantic token has a light + dark value across all 16 presets (parity), and computed **WCAG AA contrast** holds for every fg/bg pair in each of the 32 theme×mode combos; `--preset <name>` to scope.

**Validate (static gate)**

- `check [path]` — design-lint on *usage*: hardcoded color not from a token, missing `use client`, off-scale spacing / arbitrary Tailwind values, barrel-in-browser-bundler; `--fix`. (`tokens check` validates token *definition*; `check` validates token *usage*.)
- `doctor [paths]` — react-doctor wrapper, version-pinned + flag-normalized (`--scope` / `--base` / `--blocking`); ships vllnt `doctor.config` so consumers inherit the same gate.
- `gate` — compose L0 (`tokens check` + `theme check` + reduced-motion) + L1 (`check` + `doctor` + eslint/stylelint bundle) + L2 (`tsc`); one verdict, one exit code. `--staged` (pre-commit), `--scope changed --base origin/main` (PR), `--scope full` (main). The local==CI parity primitive.

**Setup / standardize**

- `init` — scaffold the standard files (components.json @vllnt registry, Tailwind preset, tokens css, `doctor.config`, pre-commit hook, CI caller); idempotent.
- `sync` — re-pin every preset + the config bundle to the installed `@vllnt/ui` version; report + fix drift. Upgrading `@vllnt/ui` propagates the DX baseline to all repos.
- `ci` — emit the reusable-workflow caller (`uses: vllnt/ui/.github/workflows/dx.yml@vN`).
- `add <c…>` — `shadcn add @vllnt/<c>` passthrough, registry URL pinned.

**Audit (heavy — its own CI job, never in the fast gate)**

- `audit` (L3) — knip (dead code / exports / deps) + size-limit (per-component bundle budgets).
- `audit --browser` (L4) — boots app / Storybook; agent-browser drives axe ×(light+dark), Web Vitals (LCP/INP/CLS, ×N-run median vs budgets), console/hydration scan, multi-viewport screenshots + snapshot diff.

**Cross-cutting:** `--json` · `--ci` (auto from `$CI`) · `--scope full|changed|staged|lines` · `--base <ref>` · `--fix` · `--quiet`. Exit codes: `0` ok · `1` violations · `2` usage.

### Open architecture decisions (from gap analysis)

Resolve before building — each gates one of the four pillars:

- **Package shape → fast install.** Bin on `@vllnt/ui` pulls the heavy lib (next/* · @xyflow · syntax-highlighter) onto the CLI install path → slow cold `npx`. **Recommendation:** ship a tiny zero-dep `@vllnt/ui-cli` (single esbuild bundle); brand stays via alias/docs, not the package graph. *(Reverses the earlier bin-on-`@vllnt/ui` pick — flagged for ratification.)*
- **Two-layer split.** Fast universal core (`context` · `gate` · `check` · `tokens` / `theme check` · `init` · `config` · `fix`) vs heavy stack-specific layer (`audit --browser` · `add` · `new` / scaffold · codemods). The single-command / fast / common promise holds **only for the core**; the heavy layer stays lazy + opt-in.
- **Framework support matrix → RESOLVED: agnostic core + adapter seam.** The engine is framework-agnostic by construction — CDP (client), OTel (server), Lighthouse/axe (rendered), tokens→CSS, and the review/intent artifacts + MCP all operate on a *running app*, not a framework. A thin **adapter** supplies the framework-specific bits: element→component resolution (React DevTools hook · Vue devtools · Svelte · …), route/target discovery (Next · TanStack Router · Vue Router/Nuxt · Remix · Astro · SvelteKit), server-instrument scaffold (`instrumentation.ts` vs each framework's hook), HMR + dev-server detection. First-party adapters ship **demand-driven** (Next first — the registry app — then whatever a real consumer uses); a documented adapter contract lets others be added. **Distinct from component availability:** the *tooling* is framework-agnostic; the *@vllnt/ui components* are React (+ native) — Vue/Svelte component parity is a separate multi-framework-port bet, but the tokens + Tailwind preset are already cross-framework, so any app can consume the design system and be reviewed/scored by studio without native components.
- **Version handshake.** A standalone CLI must verify it matches the installed `@vllnt/ui` token + registry schema before `tokens check` / `add`.
- **Autofix safety.** `fix` / `upgrade` codemods default to dry-run + diff preview (never blind-rewrite bespoke UI); CLI telemetry opt-in only.

**MVP gate** (proven by running like a consumer):

- `gate` returns an **identical pass/fail verdict locally and in CI** on a sample `@vllnt/ui` consumer repo.
- `theme check` **fails** on a deliberately broken contrast in one preset and **passes** clean on the 16 shipped presets.
- `tokens check` **fails** when a CSS var in `themes/*.css` or the registry Tailwind config doesn't trace to a token (drift), and **passes** when `tokens.json` is the sole source.
- `init` produces a repo whose pre-commit hook + CI both call `vllnt-ui gate` with no hand-edits.
- cold `npx <cli>@latest gate` runs on a clean machine with **no component-lib download** (fast-install pillar).

The L4 browser-audit tier may roll to a later `0.4.x` / `0.5.0` under scope pressure.

---

## Release mapping

Version ≠ phase — phases are outcomes; this maps them to release trains across the packages.

| Phase | Ships as | Rationale |
|---|---|---|
| component-sidebar | `@vllnt/ui` **0.4.0** (now) | UI feature — finish + ship small |
| ai-elements-parity | `@vllnt/ui` **0.5.0** | new components = minor |
| native-parity | `@vllnt/ui` **1.0.0** | `.native.tsx` in registry items = registry-schema change → the 1.0 "commit the web+native contract" moment |
| agent-ui-cli | `@vllnt/ui-cli` **0.1+** | separate package, own version line (bin `vllnt-ui`) |
| studio · review-loop · authoring-loop · studio-hub | `@vllnt/front-studio` + `@vllnt/ui-toolbar` **0.x** | own packages, lazily invoked, own version lines |

`@vllnt/cli` (brand root) stays reserved for a future brand-wide CLI. Independent versioning via changesets — monorepo ≠ lockstep.

## Versioning policy

- **Patch** (`0.3.x`) — bug fixes, content updates, non-breaking docs.
- **Minor** (`0.x.0`) — new components, new public APIs, new site surfaces.
- **Major** (`x.0.0`) — breaking API changes (`@vllnt/ui` exports), removed components, registry schema changes.

Semver discipline starts hard at `1.0.0`. Until then, `0.x.0` may include breaking changes documented in CHANGELOG.

## Out of scope (this cycle)

- React Compiler adoption.
- Right-to-left language support.
- Backend services for `/report` or `/request-component` (prefilled GitHub URLs — no backend).
- New design tokens beyond DESIGN.md baseline.
- Versioned docs (deferred until breaking changes appear).
- Component analytics (privacy-respecting telemetry — separate decision).

---

## Tracking

- Open issues: `gh issue list -R vllnt/ui --state open` (currently 0 — file issues per phase as work starts; the repo enforces issue-linked PRs).
- react-doctor score: `pnpm doctor:score`.
- Channels: `npm view @vllnt/ui dist-tags`.

---

## Archive

Full task detail for completed phases — collapsed above to keep the active roadmap scannable. History is preserved, never deleted.

### component-library [DONE 2026-06]

**Exit criteria:** `registry.json` carries 309 components, each with a story + test; `@vllnt/ui@0.3.0` published to npm.
**Verify:** `npm i @vllnt/ui@latest` resolves 0.3.0; `/components` lists 309; `npx shadcn add @vllnt/<c>` installs a leaf + its siblings.

- [x] component-library.1 Ship +169 components → 309 total (full list in CHANGELOG `[0.3.0]`) — #159–#204
- [x] component-library.2 Hybrid CLI installs: leaf source + `@vllnt/ui` for siblings — #232
- [x] component-library.3 Registry-item richness: `version`, `stability`, `a11y` schema, inline `examples`, TSDoc props per `/r/<name>.json` — #242, #253–#255
- [x] component-library.4 Validate: component-count guard + per-component story/test green

### agent-surface [DONE 2026-06]

**Exit criteria:** robots, sitemap, canonical URLs, `/llms.txt` + `/llms-full.txt`, JSON-LD on every page, PWA manifest, breadcrumbs, custom 404, MCP server live; Lighthouse SEO ≥ 95.
**Verify:** `/llms.txt` validates (llmstxt.org); Google Rich Results clean on `/components/[slug]` + `/design`; MCP smoke-tested in Claude Desktop.

- [x] agent-surface.1 `robots.ts` (11 AI crawlers) + `sitemap.ts` — #233, #234
- [x] agent-surface.2 Canonical URLs + keywords / verification / author metadata — #237, #241
- [x] agent-surface.3 `/llms.txt` + `/llms-full.txt` — #235, #236
- [x] agent-surface.4 JSON-LD (Organization, WebSite, SoftwareSourceCode, ItemList, BreadcrumbList) + manifest + custom 404 + breadcrumbs — #238, #239, #240, #251
- [x] agent-surface.5 Release-intelligence surface: `/changelog`, `/releases`, `/rss.xml`, `/atom.xml` — #260
- [x] agent-surface.6 `@vllnt/mcp` server at `ui.vllnt.ai/mcp` — #246
- [x] agent-surface.7 Community paths: footer, header GitHub icon, `/request-component`, `/report`, FUNDING, shadcn-CLI install path — #243–#247, #261, #265
- [x] agent-surface.8 Brand: DESIGN.md + `/design` + `design.tokens.json` — #250
- [x] agent-surface.9 Landing rebuild to OSS-library best practices — #264

### codebase-health [DONE 2026-06]

**Exit criteria:** react-doctor workflow + PR annotations; 0 BLOCKING errors; warning sweep 1769 → under 100 (epic #279).
**Verify:** `pnpm doctor:errors` exits 0 on main; CI annotates PRs.
**Caveat:** local `.react-doctor.json` score reads **71** (epic target was 90) → carried to Later: `react-doctor-90`.

- [x] codebase-health.1 CI: enforce issue `type` + react-doctor workflow + `pnpm doctor*` scripts + pre-commit — #278, #280, #282
- [x] codebase-health.2 Fix 7 BLOCKING errors (rules-of-hooks + combobox a11y) — #266
- [x] codebase-health.3 Warning sweep across 12 categories (design system, React 19, perf, correctness, a11y, …) — #231, #267–#277
- [x] codebase-health.4 README count + `package.json` repo fields — #249

### release-pipeline [DONE 2026-06]

**Exit criteria:** every merge to main publishes `@canary`; stable via manual `workflow_dispatch`; 0.3.0 published; 0.4.0 canary cycle started.
**Verify:** `npm view @vllnt/ui dist-tags` → `latest: 0.3.0`, `canary: 0.4.0-canary.<sha>`.

- [x] release-pipeline.1 Stable 0.3.0 publish (changelog + counts) — #433
- [x] release-pipeline.2 Advance install target to `@vllnt/ui@0.3.0` (post-publish) — #458
- [x] release-pipeline.3 Start 0.4.0 canary cycle (version bump + roadmap) — #459 (PR #460), verified `0.4.0-canary.cb3c196` on npm
