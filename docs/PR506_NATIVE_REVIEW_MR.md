# PR506 Native individual review: M–R

Test paths below record historical commands. See the [organization path map](NATIVE_TEST_ORGANIZATION.md) for current locations; assertions are preserved.

Related to https://github.com/vllnt/ui/pull/506.

## Scope and evidence

Individually read all **31/31 directories**, each containing one implementation TSX file, under `packages/ui-native/src/components` whose directory name starts M–R. Root-level shared test files were not counted as component directories. Reviewed exported props/ref forwarding, state ownership, disabled/loading behavior, semantics, service callbacks, animation cleanup and token use where applicable. Read root AGENTS, all four docs/agents rule documents, DESIGN.md and design tokens. No nested Native AGENTS found. No shared primitives, barrel, existing tests, workflow or changelog modified.

**12 component implementations repaired cumulatively; 22/22 focused Jest test cases pass.** The original batch contributed 11 cases across 8 directories; task #52 adds 11 cases and repairs four additional directories plus NumberInput. Remaining 19 directories have static inspection only. Static inspection is not runtime proof. No device, screen-reader, keyboard, visual, Expo or aggregate workspace gate was executed. The task-board tool was not available; the plan and completion evidence are recorded here instead.

## Individual inventory

All paths below are relative to `packages/ui-native/src/components/`; each row covers the entire `<directory>/<directory>.tsx` implementation, including internal helpers and named exports.

| Directory | Individual findings / disposition | Executed coverage and remaining limitation |
| --- | --- | --- |
| marquee | Content/viewport measurements drive a bounded repeat track; mirrored lane hidden from accessibility; loop stopped on dependency changes/unmount; reduced motion removes duplicate lane. | Static only. Continuous autoplay has no explicit pause control; host can set duration 0 but must supply accessible pause UI. Real layout/loop seam and touch behavior unverified. |
| menubar | Controlled/uncontrolled active menu, disabled commands, callback/link dispatch and rejected link error forwarding inspected; ref targets toolbar root. | Static only. Long command lists are not scroll-contained; modal fit, focus return and disabled active-menu transitions need device checks. |
| meter | Finite ordinary min/max/value normalization, segment cap, progress semantics/valueText and semantic fill tokens inspected. | Two tests prove opposite-sign MAX_VALUE midpoint is 50%, and collapsed MAX_VALUE bounds produce 0% rather than NaN%. Overflow-safe half-scale arithmetic and explicit collapsed-range handling repaired. Segmented contrast/measurement semantics need device checks. |
| metric-cluster | Four edge anchors, caller-keyed entries, optional announcements and per-entry accessible labels inspected. | Static only. Tone is visually only a dot color unless caller supplies explanatory label/value; live-region behavior on iOS unverified. |
| model-selector | Selection/open ownership, query filtering, unavailable model disabling, localized labels, reduced-motion modal and ref-to-panel inspected. | Static only. External controlled close does not reset query (internal close does); intended persistence unspecified. Modal focus and unavailable-reason announcement unverified. |
| multi-select | Fixed options remaining operable when root becomes disabled while modal is already open. Both native disabled prop and accessibility state now include root disabled. Filtering and immutable selection helper call inspected. | New test opens modal, rerenders disabled, asserts checkbox disabled and no callback on press. Actual modal focus not proven. |
| native-select | Thin Select facade forwards all props and ref and aliases option/label types; no separate native picker implementation claimed. | Static only; inherited Select behavior belongs to its owning batch. |
| navigation-menu | Current/expanded identities, panel-vs-link semantics, callbacks/error forwarding, disabled triggers and ref inspected. | Static only. Panel rendering for externally selected disabled item remains caller-controlled; keyboard/focus/navigation service unverified. |
| number-input | Fixed discarded caller input style by composing it after internal layout style. Inspected numeric bounds/step normalization, input ref, disabled actions and accessibility action routing. | Style assertion plus two follow-up editing tests: minus/decimal drafts persist, blur restores canonical bounded numeric text, controlled external updates win, and step actions clear drafts. Finite callbacks remain immediately bounded; incomplete drafts do not emit numbers. Controlled undefined still cannot distinguish empty controlled state from uncontrolled state: separate API policy question, unchanged. |
| number-ticker | Animation stops/removes listener on replacement/unmount; reduced motion immediately shows target; accessible label announces target rather than intermediate frame. | Two follow-up tests cover invalid numbers in reduced-motion and motion-enabled paths. Nonfinite from/value become 0; negative/nonfinite or millisecond-overflow delay/duration become 0 (invalid duration skips animation). Intl invalid locale/options still throw by standard Intl contract; swallowing caller configuration errors is not required. Actual platform timing/Intl coverage unverified. |
| overview-board | OverviewCard and board refs/style forwarding, explicit optional CTA, empty list and metric announcements inspected. | Static only. Tone border alone is not sufficient warning/error explanation; callers must include it in content. Large text/card CTA layout unverified. |
| pagination | Finite count/current/window normalization and 100-option cap; edge disable, link errors, callback/ref forwarding inspected. | Static only. Noncurrent page labels are numeric text rather than labels.page; current-page suffix remains English. Locale contract follow-up needed. |
| panel | All six exports accept/forward correct View/Text refs and caller styles; title uses header role; token surfaces and separators inspected. | Static only. No interactive state/lifecycle; screen-reader hierarchy and clipping with large text unverified. |
| password-input | Secure entry toggles only through explicit labeled action; disabled toggle and input ref/style forwarding inspected. | Static only. Show/hide overlay has fixed padding/width; long localized labels and platform secure-entry selection behavior unverified. |
| phone-input | Static country prefix is accessible text; callback prefix becomes disabled-aware button; telephone input/ref/style forwarded. | Static only. Country-picker integration is deliberately host-owned; touch target/large localized text unverified. |
| plan-badge | Tier/state mapping, explicit Trial/Legacy text, caller accessibility override and ref forwarded through Badge. | Static only. Lifecycle suffix localization not exposed separately; inherited Badge visuals unverified. |
| popover | Controlled/uncontrolled modal state, close reason callback, localized cancel, reduced-motion behavior and ref inspected. | Static only. Modal adaptation is explicit, not anchor positioning; overflowing children are not scroll-contained. Device focus/safe area unverified. |
| presence-stack | User keys, textual accessible status, hidden decorative dots, overflow action and ref inspected. | Static only. Overflow target is visually 32 points; visible status is color-only, while accessible label has text. Large lists/nonfinite max and physical targets unverified. |
| presence-sync-indicator | Explicit state/status text, semantic token mapping, caller label override, polite live region and ref inspected. | Static only. iOS live announcements and contrast unverified; no async work owned by component. |
| progress-bar | Fixed NaN/Infinity flowing into width percentages and accessibility values: nonfinite max/value resolve to 0. Existing finite clamp/loading semantics retained. | Four new cases cover invalid max/value combinations with finite accessible range and 0% text. Real native layout not proven. |
| progress-card | Static vs pressable wrapper contract, ref/props, progress/metadata/tags and optional callback inspected. | Static only (inherits repaired ProgressBar). Nested accessible progress within pressable card may require combined accessible label to retain full information on device. |
| progress-tracker | All compound parts, required context error, progress normalization, module status/locked navigation and root refs inspected. | Static only. Ratio-or-percent normalization is ambiguous for 1; raw lesson/exercise/streak counts are not normalized and module progress label may differ from completedLessons bar. Requires explicit data-contract decision, not speculative rewrite. |
| prompt-input | Controlled/uncontrolled draft, guarded submit, loading/unavailable action, service message, newline/submit mapping and content-size clamp inspected. | Two follow-up tests prove nonfinite rows use defaults and existing measured height is reclamped immediately on row-limit rerender, then restored when limits expand. Rows normalize to positive integers; invalid measurement events are ignored. No asynchronous completion contract claimed by void onSubmit. |
| quiz | Fixed scalar explanation ReactNode being mounted directly under View: string/number now wrapped in token-styled Text. Three controlled/uncontrolled state tracks, selected option lookup, submitted disabling, reset and question relationship inspected. | New test queries scalar explanation as native text. Actual assistive result announcements and correctness color cues unverified. |
| radio-group | Explicit undefined controlled support, inherited disabled state, stable selection keys, descendant callback cancellation, radio roles and both refs inspected. | Static only. Platform radio traversal and custom child accessibility unverified. |
| range-calendar | Fixed time-of-day excluding start-day selection by normalizing endpoints to local midnight; reversed endpoints ordered and invalid start treated as empty without mutating caller dates. | Two new tests cover non-midnight inclusive endpoints, preceding unselected day, reversal and invalid start. DST/time-zone device behavior and disabled interior dates policy remain unverified. |
| rating | Fixed uncontrolled value becoming out of range after max shrinks: normalize displayed/checked value against current safe max each render. Controlled state, allowClear, readOnly and option cap inspected. | New rerender asserts max-3 option checked and 3-of-3 text after default 5. Underlying uncontrolled value is retained if max later expands; no implicit change callback introduced. |
| reasoning | Fixed scalar duration ReactNode mounted directly under Pressable: string/number now token-styled Text. Streaming forces open/disabled trigger; controlled ownership and stable step keys inspected. | New test queries scalar duration as native text. Streaming end reverts to caller/internal open state by existing design; no timer owned. |
| resizable | Constraint total validation, proportional normalization, child indexing, rerender signature reset, bounded neighboring adjustment, refs and accessible disabled orphan handle inspected. | Three follow-up tests individually prove NaN minSize/maxSize/defaultSize no longer poison flexGrow or resize callbacks. Nonfinite props use existing defaults, including standalone panels; step must be finite and positive. Pointer/touch dragging explicitly absent; accessibility-only actions require device proof. Wrappers/fragments are not discovered as direct panels. |
| reveal-text | Fixed invisible content retaining pointer hit testing: pointerEvents none while hidden; caller pointer behavior restored when shown. Effect cleanup stops prior animation; hidden accessibility descendants inspected. | New hidden/visible prop assertion. Native hit-test dispatch and exit animation visuals not runtime-proven; delay nonfinite values and eight-point motion vs DESIGN less-than-eight guidance remain follow-up. |
| role-badge | Role label/variant mapping, accessible label override and Badge ref/props forwarding inspected. | Static only. No state/services/timers; inherited Badge device visuals unverified. |

## Validation

Runtime: Node **v22.23.2**, `corepack pnpm@9.15.4`.

Executed from repository root:

```sh
export PATH=/Users/bntvllnt/.nvm/versions/node/v22.23.2/bin:$PATH
corepack pnpm@9.15.4 -F @vllnt/ui-native exec eslint src/components/{native-review-mr.test.tsx,multi-select/multi-select.tsx,number-input/number-input.tsx,progress-bar/progress-bar.tsx,range-calendar/range-calendar.tsx,rating/rating.tsx,reveal-text/reveal-text.tsx,quiz/quiz.tsx,reasoning/reasoning.tsx}
corepack pnpm@9.15.4 -F @vllnt/ui-native exec jest --runInBand src/components/native-review-mr.test.tsx
git diff --check
```

Final result: ESLint exit 0; **1 suite passed, 11 tests passed, 0 snapshots**; diff whitespace check exit 0. Initial test authoring exposed an unavailable matcher and an ambiguous label query, both corrected. Initial lint caught function-length growth, corrected without suppression. Tests use React Native's Jest renderer/mocks, not a running native application. No pre-fix regression run was performed; the assertions target the inspected pre-fix paths, but red-before-green is not claimed.

## Task #52 follow-up validation

Plan completed: inspect five contracts, reproduce concrete defects, repair only owned paths, run focused tests/lint, update this report. Task-board API unavailable in this child session; no board status changes claimed.

Red evidence: initial combined run had 9 failed / 11 passed; six failures directly demonstrated NaN panel layout, stale/nonfinite prompt height, and nonfinite ticker output. Three initial assertions needed harness fixes (ambiguous NumberInput label and non-host Meter style query). With corrected assertions and the original NumberInput display/Meter ratio restored temporarily, `jest ... -t 'transitional|extreme finite'` failed **3/3**: minus discarded, midpoint 0% instead of 50%, collapsed range NaN%. Motion-enabled test with original timing inputs restored failed with `Animated.delay(Infinity)` and a timeout-overflow warning. All temporary reversions were removed. One async renderer test-authoring mistake was corrected before timing red proof.

Final commands (same Node v22.23.2 / corepack pnpm@9.15.4 runtime):

```sh
corepack pnpm@9.15.4 -F @vllnt/ui-native exec eslint --fix src/components/{native-review-mr.test.tsx,number-input/number-input.tsx,resizable/resizable.tsx,meter/meter.tsx,prompt-input/prompt-input.tsx,number-ticker/number-ticker.tsx}
corepack pnpm@9.15.4 -F @vllnt/ui-native exec jest --runInBand src/components/native-review-mr.test.tsx
git diff --check
```

Result: lint exit 0; **1 suite passed, 22 tests passed, 0 snapshots**; whitespace exit 0. No aggregate build/typecheck, device/visual run, commit, push, dependencies or shared-file edits. No design token/visual deviations introduced. Parent owns aggregate gates and release-note integration. Remaining questions (controlled undefined ownership, Intl caller-error policy) are distinct from the five repaired code defects.

Follow-up paths (this run only):

- `packages/ui-native/src/components/number-input/number-input.tsx`
- `packages/ui-native/src/components/resizable/resizable.tsx`
- `packages/ui-native/src/components/meter/meter.tsx`
- `packages/ui-native/src/components/prompt-input/prompt-input.tsx`
- `packages/ui-native/src/components/number-ticker/number-ticker.tsx`
- `packages/ui-native/src/components/native-review-mr.test.tsx`
- `docs/PR506_NATIVE_REVIEW_MR.md`

## Original batch changed paths

- `packages/ui-native/src/components/multi-select/multi-select.tsx`
- `packages/ui-native/src/components/number-input/number-input.tsx`
- `packages/ui-native/src/components/progress-bar/progress-bar.tsx`
- `packages/ui-native/src/components/quiz/quiz.tsx`
- `packages/ui-native/src/components/range-calendar/range-calendar.tsx`
- `packages/ui-native/src/components/rating/rating.tsx`
- `packages/ui-native/src/components/reasoning/reasoning.tsx`
- `packages/ui-native/src/components/reveal-text/reveal-text.tsx`
- `packages/ui-native/src/components/native-review-mr.test.tsx`
- `docs/PR506_NATIVE_REVIEW_MR.md`

Parent owns shared fixes, release notes, aggregate gates and PR readiness. Remaining limitations above are not waived by the focused test pass; this report does not certify merge readiness.
