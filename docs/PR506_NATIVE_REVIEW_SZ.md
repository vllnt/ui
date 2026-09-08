# PR506 Native S–Z component review

Test paths below record historical commands. See the [organization path map](NATIVE_TEST_ORGANIZATION.md) for current locations; assertions are preserved.

Related to https://github.com/vllnt/ui/pull/506.

## Scope and evidence

Individually read **59/59 directories, 59/59 implementation files** in `packages/ui-native/src/components` whose directory begins S–Z, including internal helpers and all exports. Each directory contains its same-named `.tsx` file. Read root instructions, all four `docs/agents` documents, `DESIGN.md`, and `packages/design/tokens.json`. No nested Native AGENTS files found. React 19 ref-as-prop guidance supersedes the older forwardRef rule. No shared primitives, existing tests, barrel, dependencies, workflows, or changelog changed.

**Seven component files repaired; seven new focused regression tests pass.** Tour includes both state recovery and accessibility exposure repairs. This is complete static inventory coverage, **not complete production-readiness or runtime coverage**. Additional findings below remain unresolved. No device, VoiceOver/TalkBack, visual, keyboard, isolated-consumer or aggregate workspace proof was obtained. Parent owns aggregate checks, release notes and PR readiness. Task-board tools were unavailable; no board statuses could be changed.

## Executed checks

Environment: `/Users/bntvllnt/.local/bin/node` reports **v22.23.2**; all pnpm commands use **corepack pnpm@9.15.4** with that directory prepended to PATH.

From repository root:

```sh
PATH=/Users/bntvllnt/.local/bin:$PATH corepack pnpm@9.15.4 -F @vllnt/ui-native exec jest --runInBand src/components/native-review-sz.test.tsx src/components/review-state.test.tsx
```

Result: **2 suites passed, 13 tests passed, 0 snapshots**. Seven are new S–Z tests; six are existing state regressions (including components outside this inventory, not claimed as additional audit coverage). The initial new suite was red before repairs; the first post-repair run exposed an unavailable matcher (replaced with a prop assertion) and Tour's inaccessible progress View (repaired). Consequently the initial 7 failures are not claimed as seven clean before/after proofs.

Touched-file ESLint with `--fix` completed successfully for the seven repaired implementations plus the new test. It applied repository formatting. No typecheck/build/aggregate gates run, as requested.

## Per-directory assessment

All paths below are relative to `packages/ui-native/src/components/`. “Static” means source inspection only in this batch. All rows retain the global device/visual limitations above; passing JS tests do not prove native platform semantics.

| Directory | Individual findings and evidence | Remaining limitation |
|---|---|---|
| `scramble-text` | Static: deterministic pool, full accessible label, reduced-motion branch and timeout cleanup; ref reaches Text. | Counts UTF-16 units but scrambles code points; astral characters can lengthen the reveal. No timer/device assertion here. |
| `scroll-progress` | Static: caller owns scroll metrics; overscroll clamped, no-scroll range returns zero; progress role/value emitted. | NaN inputs remain NaN; native accessibility focusability unverified. |
| `search-bar` | Static: controlled/uncontrolled query, trimmed explicit/keyboard search, caller submit callback composed. | Missing client directive despite useState; input read-only settings do not disable the separate search action (may be intentional). |
| `search-dialog` | Static: scopes, filtered/sorted local results, controlled open/query/scope, reduced-motion modal, request sequence rejects superseded queries. | Async effect has no unmount cleanup; rejection is presented as empty results, not a distinct error; changing search service for same query can display stale cached results. Needs focused async follow-up. |
| `search-field` | **Fixed:** clear action no longer mutates `editable={false}` or `readOnly` inputs; state update also guarded. New “does not clear a read-only search field” passes. | Test exercises editable=false; readOnly branch and device keyboard untested. |
| `segmented-control` | Static: stable IDs, radio/checked state, parent+item disabled composition, controlled selection, 44-point targets. | Caller label/role overrides via trailing props; keyboard and long labels unverified. |
| `select` | Static: modal picker with disabled options, selected lookup, close notifications, invalid text, reduced-motion handling. | Explicit trigger label omits current value; screen-reader announcement and safe-area handling need device proof. |
| `separator` | Static: horizontal/vertical dimensions, decorative accessibility default, semantic nondecorative role, ref forwarding. | Native support for separator role and vertical parent sizing unverified. |
| `severity-badge` | Static: textual severity supplements semantic colors, decorative dot hidden, localized label options, grouped label. | Solid non-danger foreground pairing needs contrast verification under custom themes. |
| `share-dialog` | Static: injectable/unavailable share service, result/error callbacks and modal close path; reduced motion honored. | No pending guard: repeated presses can issue concurrent shares; late completion can close a reopened dialog. Requires async lifecycle regression/fix. |
| `share-section` | Static: pending state disables action, try/catch/finally, truthful unavailable label, service injection. | Same-render duplicate presses rely on state rather than synchronous lock; callback can fire after unmount. |
| `sheet` | Static: four edge layouts, controlled visibility, close reasons, safe-area renderer, reduced motion. | Native modal slide direction is not per-edge; overflowing content and device safe area unverified. |
| `shimmer-text` | Static: semantic color loop, explicit stop cleanup, reduced-motion static branch; ref preserved. | Continuous decorative cycle conflicts with DESIGN purpose-only motion; no pause prop, design exception needed. |
| `sidebar` | Static: provider visibility/density, disabled destinations, selected ID, injected linking rejection callback, compact labels remain accessible. | Missing client directive for hook consumer; device navigation and URL service contract not independently retested. |
| `sidebar-provider` | Static: context misuse throws, controlled/uncontrolled open, memoized value and toggle, wrapper ref. | Repeated toggles within one render use captured open value. No provider-specific runtime assertion here. |
| `sidebar-toggle` | Static: inherited disabled, expanded state, dynamic label and style callback, provider toggle. | Missing client directive for hook consumer; glyph behavior and keyboard focus unverified. |
| `skeleton` | Static: deliberately static, accessible only when caller opts in or labels it, token surface and ref. | No busy/announcement claims; caller must communicate loading elsewhere. |
| `slider` | **Fixed:** uncontrolled stored value normalized against current min/max/step before rendering and adjustment; prevents out-of-range width/value after bound changes. New shrink/decrement test passes (80 → max20 → decrement19). | Finite-value validation, responder coordinate behavior on child targets, physical drag and RTL unverified. |
| `slideshow` | Static: missing/removed selection falls back to first section, empty list returns null, navigation boundaries, caller-owned completion, inline contents list avoids stacked modal. | Contents button uses checked state despite button role; long TOC overflow and native modal focus not tested. |
| `spinner` | Static: native ActivityIndicator with context label, progress role, busy state and semantic color. | Numeric size support on iOS and reduced-motion platform behavior need device verification. |
| `spinning-text` | Static: code-point layout, full accessibility label, hidden glyphs, active/reduced-motion stop, loop cleanup. | Decorative rotation conflicts with DESIGN spin restriction; design exception or changed behavior required. |
| `stat-card` | Static: composed Card, tabular value, textual trend, hidden accent and optional details. | Falsy optional ReactNodes (e.g. numeric zero change/meta) omitted; trend words not caller-localized. |
| `status-board` | **Fixed:** grouped accessible service label now includes description, metric/fallback and metadata instead of hiding that information behind only name/status. New exact-label regression passes. | Native spoken grouping/announcements and custom-theme contrast unverified. |
| `status-indicator` | Static: tone paired with text, grouped label, opt-in live region, dot hidden and size map. | Solid neutral contrast under theme overrides needs verification; no rendered contrast proof. |
| `step-by-step` | Static: exported Step/compound StepByStep refs, interactive labels enforced, completion toggles preserve other IDs. | Progress counts obsolete/duplicate completed IDs; generic valid elements accepted as Step; interactive rendering does not preserve Step's ref/style/view props. Needs contract follow-up. |
| `step-navigation` | Static: caller-owned previous/next eligibility, disabled semantics and localized action labels, safe-area callback and counter. | Counter trusts caller bounds; disabled controls have no distinct opacity treatment. |
| `stepper` | **Fixed:** current step re-normalized after uncontrolled steps shrink; last remaining step remains selected. New shrink regression passes. | Index-based selection does not preserve identity across reorder; NaN currentStep not normalized. |
| `sticky-metric` | Static: parent-relative absolute anchor offsets, semantic tone dot, optional announcement, readable value and ref. | Despite screen-edge wording, actual containing View owns coordinates; tone itself may be color-only, zero detail omitted. |
| `switch` | Static: platform controlled value, checked/disabled accessibility merge, callback and ref, theme tracks/thumb. | Caller must supply label; iOS sizing and platform interactions not exercised. |
| `tabs` | Static: controlled context, stable IDs, only selected panel mounts, disabled trigger. Existing `review-state` test passes for mounted first/second panels. | Selected trigger can still reference an absent optional TabsContent; panel can reference absent trigger. Full compound registration not implemented. |
| `tag-group` | Static: optional selection and removal separated, stable IDs and disabled composition, immutable selection helper. | onRemove without removeLabel silently suppresses removal; selected state uses button rather than checkbox semantics. |
| `tags-input` | Static: keyboard/button commit, trimmed deduplication, controlled tags, draft and explicit removals. | editable/readOnly props not consistently applied to add/remove; normalization compares only array length and may discard same-length content changes. |
| `terminal` | Static: commands-only clipboard content, error/success callbacks, copied label keyed to command string, unavailable fallback, parser and refs. | Concurrent copies/late completions not guarded; prompt-hidden accessibility differs across platforms. |
| `text` | Static: complete shared size/weight mapping, semantic tone, caller style last, NativeText props/ref forwarded. | Typeface overrides are not applied here; typography/device font scaling not verified. |
| `text-animate` | Static: initial visibility initializes progress, explicit transitions, segment labels hidden, full root label, stopped effect, reduced motion. | Invisible content remains accessible; slide offset equals 8px rather than DESIGN <8px; no device animation proof. |
| `text-field` | Static: type requires accessible or string visible label; hint composes helper/error, alert only when nonempty, Input ref forwarded. | Empty-string error still marks input invalid; platform error announcement unverified. |
| `text-reveal` | Static: caller-driven progress, clamping and reduced-motion full visibility; full accessible string, hidden words. | Whitespace collapsed and low-opacity text contrast requires design decision; NaN not normalized. |
| `text-shimmer` | Static: semantic color cycle, stop cleanup, static foreground under reduced motion, ref. | Same continuous decorative-motion design exception as shimmer-text. |
| `textarea` | Static: delegates Input, forces multiline, top alignment and 80-point min-height, forwards input ref/style. | Caller label responsibility; multiline keyboard/scroll behavior unverified. |
| `thinking-block` | Static: streaming forces open and disables collapse, controlled/uncontrolled expanded state, conditional content and polite streaming text. | Restores pre-stream expansion state by design; streaming announcement frequency not device-tested. |
| `time-field` | Static: strict HH:mm range validation, draft editing, commit on blur/submit, controlled reset. Existing controlled reset test passes. | Numeric inputMode generally lacks colon on phone keyboards; should use text keyboard or auto-format digits. Invalid blur can display prior valid value while retaining an error. |
| `time-picker` | **Fixed:** already-open hour/minute controls now inherit disabled state and commits guard disabled. New open→disable→press test passes. | Time validator checks shape only; invalid caller hour/minute may persist; NaN minuteStep yields empty options; trigger omits selected time from explicit label. |
| `timeline-scrubber` | Static: clamped range, finite positive step fallback, incremental actions and text formatter, no drag claim. Existing range/step test passes. | Adjustable View lacks explicit accessible=true; physical accessibility actions and nested button traversal unverified. |
| `tldr-section` | Static: functional toggle, expanded state, conditional content, scalar children wrapped in Text, ref/style. | Missing client directive despite useState; decorative indicator Android hiding unverified. |
| `toast` | Static: per-instance timer map, latest callback/queue refs, removal/unmount cleanup, controlled dismiss and disabled action. | Changing an existing toast duration to persistent does not cancel its old timer; simultaneous expiries with delayed controlled updates may resurrect entries. Needs timer regressions and explicit update semantics. |
| `toggle` | Static: controlled/uncontrolled pressed state, selected semantics, preventDefault composition, scalar text wrapping, disabled native prop. | Touch/platform event defaultPrevented and keyboard behavior unverified. |
| `toggle-group` | Static: single/multiple discriminated props, stable keys, controlled explicit undefined allowed, group+item disabled, preventDefault composition. | Within-render repeated events use captured selection; device selected-state wording unverified. |
| `toolbar` | **Fixed:** ToolbarButton string/number children wrapped in token Text (raw strings under Pressable/View are invalid on native). New Text-host test passes. Separator remains decorative; orientation/ref/style preserved. | Full toolbar keyboard navigation not claimed or tested. |
| `tooltip` | Static: honest explicit-press modal help, expanded/hint labels, reduced-motion modal and close reasons. | Trigger/children ReactNode scalars are not wrapped; callers currently must provide native elements. No hover/focus claims. |
| `top-bar` | Static: leading/center/trailing slots, optional safe-area renderer, truncating title/subtitle, ref. | Center flexShrink=0 can overflow narrow screens; scalar slots need native elements. |
| `tour` | **Fixed:** uncontrolled index clamped against latest steps so shrinking list does not erase tour; progress View explicitly accessible. New shrink + progress-role/value regression passes. | ReactNode description/hint/media must be native elements; many progress dots can overflow narrow screens. |
| `tree-view` | Static: separate disclosure/selection actions, controlled expanded/selected arrays, recursive stable nodes, disabled handling, explicit no-browser-tree claim. | Large/deep trees unvirtualized; switching multiple→single can retain multiple selected IDs until next selection. |
| `truncated-text` | Static: full accessible label, configurable ellipsis/line count/max width, semantic text and ref. | Platform truncation and font scaling need visual proof. |
| `tutorial-complete` | Static: clamped completion percent, separate finished/complete labels, stable review actions, optional related/share callbacks only rendered when usable. | NaN percent not normalized; all states display check glyph; review ID uniqueness across instances unverified. |
| `tutorial-filters` | Static: controlled atomic updates, pending disables inputs/choices/actions, localizable difficulty/tags, clear actions. | Clear-all writes first difficulty rather than empty sentinel; hasFilters treats it as active so clear UI may persist. Needs explicit default-filter contract. |
| `typewriter` | Static: full accessible text, deterministic timeout, cleanup and reduced-motion complete string. | UTF-16 slicing can split emoji; same-length text replacement during an active timeout can reuse prior timer deadline. |
| `view-switcher` | Static: controlled/default selection, disabled tabs, IDs and controls only when selected panel exists. Existing panel-reference state test passes. | Removed default selection yields no selected view until user chooses; keyboard and dynamic width untested. |
| `workspace-switcher` | Static: radio selection keyed by workspace ID, disabled state, scrollable options, descriptions and optional panels. | Removed selection has no fallback; scalar panel is not Text-wrapped; no routing ownership claim. |
| `world-clock-bar` | Static: copied Date input, invalid dates/zones safely filtered, live interval cleanup, explicit now bypasses timer, accessible full clock label. | Missing client directive; fixed→live can show old timestamp until next tick; invalid zones silently disappear; Intl support/device locale unverified. |

## Follow-up priority

1. Async/timer lifecycle: SearchDialog cache/error/unmount handling, ShareDialog duplicate and stale completion, Toast duration/queue races.
2. Input/compound contracts: TimeField phone keyboard; TagsInput read-only behavior; StepByStep refs/props/counts; optional Tabs references.
3. Confirm Native design exceptions for decorative motion, glyph icons and typography; verify screen-reader focusability and long-content layouts on actual devices.
4. Parent must run fresh aggregate quality gates and typecheck, update protected release notes, and keep PR draft until outstanding release evidence is complete.

## Files changed

- `packages/ui-native/src/components/search-field/search-field.tsx`
- `packages/ui-native/src/components/slider/slider.tsx`
- `packages/ui-native/src/components/status-board/status-board.tsx`
- `packages/ui-native/src/components/stepper/stepper.tsx`
- `packages/ui-native/src/components/time-picker/time-picker.tsx`
- `packages/ui-native/src/components/toolbar/toolbar.tsx`
- `packages/ui-native/src/components/tour/tour.tsx`
- `packages/ui-native/src/components/native-review-sz.test.tsx`
- `docs/PR506_NATIVE_REVIEW_SZ.md`
