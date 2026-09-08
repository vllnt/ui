# PR506 Native component review: D–L

Test paths below record historical commands. See the [organization path map](NATIVE_TEST_ORGANIZATION.md) for current locations; assertions are preserved.

PR: https://github.com/vllnt/ui/pull/506

## Scope and evidence

Individually read **35/35 directories, 35/35 implementation files** under `packages/ui-native/src/components`, from `data-list` through `live-feed`. There are no directory-local barrels or additional files in this inventory. Reviewed public props, local exports/display names/ref forwarding, controlled ownership, disabled interaction, accessibility grouping/actions, effects, promises, platform delegation, and token usage where applicable. Read repository AGENTS, all four agent-rule documents, DESIGN, and design tokens. React 19 ref-as-prop convention supersedes the older forwardRef rule.

**Five implementations changed; nine new regression tests.** All original six regression cases were observed failing before fixes (after correcting an unsupported test matcher); two additional date/file tests were also observed failing. The non-finite zoom assertion was added after its fix, so has no recorded red run. Combined focused tests: **36/36 in five suites**. Source inspection and RN test-renderer props are not device, keyboard, screen-reader, or visual proof.

Task-board tools were unavailable, so no child task/status mutations were possible. Work completed as inventory → individual review → focused repairs/regressions → report. No agents, dependencies, commits, pushes, shared primitives/tests/barrels, aggregate builds, or CI inspection. Existing workflow, changelog, and other agents' changes preserved.

## Per-directory assessment

Paths below are relative to `packages/ui-native/src/components`; each row covers `<directory>/<directory>.tsx` in full. “Static” means no new dedicated executed assertion for that directory, even when a broader focused suite renders it.

| Directory | Individual findings and disposition | Proof and remaining limits |
|---|---|---|
| data-list | Stable caller IDs; compact/default spacing; empty fallback; ref and root props forwarded. Rows only group when caller supplies a full accessibility label. No concrete repair identified. | Static; long/rich values and reading order need device checks. |
| date-field | **Fixed** numeric keyboard mode that cannot supply required ISO hyphens on common phones. **Fixed** JS Date remapping years 0000–0099 by validating UTC full year/month/day. Controlled commit ownership retained; invalid draft is not committed. | New test checks text input mode, valid 0096 leap date and rejected 0097 leap date. Real keyboard and error announcement unverified. Controlled external updates during active editing intentionally leave local draft. |
| date-picker | Explicit controlled selection, local open state, labelled trigger/value, close action, reduced-motion-aware ModalLayer. No local timers. | Static; calendar and modal dependencies not re-audited here. Disabled currently disables opening, not an already-open calendar; policy/device follow-up needed. No safe-area adapter exposed at this wrapper. |
| date-range-picker | Same modal ownership and labels, range stays open for multi-step selection, close does not falsify committed range. | Static; range/calendar behavior delegated. Same already-open disabled and safe-area limitations as date-picker. |
| dialog | Controlled/uncontrolled open; request-close callback/reason; native ModalLayer; caller safe-area and surface props; explicit accessible close. Reduced motion overrides presentation animation. | Static; long-content scrolling is caller-owned; focus restoration, large type, safe area require native proof. |
| document-sibling-nav | Null when no destinations; stable previous/next slots; variant labels; injectable Linking result/rejection callbacks; ref/root forwarding. | Static; real URL opening unverified. Caller must handle onOpenError; no inline failure UI. Callback exceptions/synchronous service throws are not isolated. |
| drawer | Bottom modal, request-close mapping, safe-area injection, reduced-motion slide suppression, 44-point close action. | Static; drag-to-dismiss not implemented/claimed. Long content and keyboard/safe-area device checks outstanding. |
| dropdown-menu | Stable IDs, disabled host items, selection callback then close, controlled selection/open branches, scrollable modal, menu/menuitem roles. | Static; undefined selectedId selects uncontrolled mode (cannot express controlled empty selection). Native menu-role and dismissal behavior need AT testing. |
| empty-state | Sized token copy/icon/action areas, heading, ref/props forwarded; no event/timer ownership. | Static; decorative wrapper `accessible=false` does not itself hide all descendant icons; caller icon semantics matter. Rich description/title nodes are rendered in Text. |
| exercise | Three independent controlled/uncontrolled states; hint/solution only when supplied; completion/reveal actions labelled via text; state feedback; no motion. | Learning suite passed; no new dedicated assertion. Solution reveal reports selected rather than expanded; native announcement/focus unverified. |
| expandable-cards | Single expanded identity with explicit null controlled state; caller card keys; Collapsible owns trigger/content and motion. | Interactive-content suite passed; no new dedicated assertion. Delegated disclosure/animation behavior not independently device-verified. |
| faq | Independent keyed answers, immutable open-ID updates, caller-localized labels and reduced-motion service forwarded. | Interactive-content suite passed; no new dedicated assertion. Disclosure dependency and repeated synchronous activation behavior need separate coverage. |
| field | Context guards; label registration/cleanup; conditional labelled-by ID; invalid propagated; errors only when invalid and present; compound refs/display names. | Foundation suite passed; no new dedicated assertion. `accessibilityLabelledBy` is Android-specific: iOS callers must supply explicit control accessibilityLabel. No automatic iOS label-text fallback. |
| fieldset | Group/legend/body refs and styles; documented non-cascading disabled contract matches code. | Foundation suite passed; no new dedicated assertion. Host must disable child controls; no HTML fieldset semantics claimed. |
| file-upload | **Fixed** cancelled single-selection clearing files, concurrent picker launches, post-unmount callbacks/state updates, and rejected controlled proposals accumulating in internal ref. Busy/disabled chooser state and disabled remove semantics now explicit. URI dedup and service-unavailable fallback retained. | Four new tests: cancellation, one pending picker/busy, unmount suppression, controlled rejection. Host picker not cancellable through current service contract; disabling/changing adapter mid-flight does not invalidate its pending result. Real picker unavailable in this review. |
| filter-bar | Labelled toolbar layout with wrapping; child controls retain independent events/state; root ref forwarded. | Static; native toolbar traversal unverified. No keyboard handler hijacking. |
| flashcard | **Fixed** accessible labelled side container swallowing descendant question/answer content on native screen readers: container no longer groups descendants. Controlled flip, localized action, no decorative animation retained. | New test asserts ungrouped container and question/answer nodes after flip. Test renderer can find descendants even under grouping, so grouping assertion is structural evidence, not VoiceOver proof. |
| floating-action-button | Required accessible label; disabled state mirrored; forwarded Pressable events/ref/style function; 48-point token size. | Static; absolute bottom position requires host safe-area positioning/style override. No motion lifecycle. |
| floating-toolbar | Stable action IDs, disabled Pressables and state, named actions/toolbar, semantic color variants, explicit host coordinates. | Interactive-content suite passed; no new dedicated assertion. Viewport bounds/safe-area are host-owned; real focus navigation unverified. |
| form | Context submit only on explicit action; disabled submit host; empty message omitted; message live alert; all exported refs/display names. | Static; callback async rejection/loading remains caller-owned (`onSubmit` is void contract). Native grouping intentionally not HTML form submission. |
| glass-progress | Finite clamping 0–100 shared between width and accessibilityValue; determinate progress role; ref/style forwarded; no animation. | Static; non-finite input maps zero. Native spoken progress/contrast unverified. |
| grid | Typed 1–12 columns, token gap, child wrappers, caller key preservation through Children.map, ref/style forwarding. | Foundation suite passed; no new dedicated assertion. Empty children/fragment layout, font-scale and narrow layout need visual checks. |
| heading | Semantic level independent of visual size; header role/aria-level; token heading weight and scale; ref/text props forwarded. | Static; actual level announcement platform-dependent, no native AT proof. |
| horizontal-scroll-row | ScrollView ref, style/content style composition, enforced horizontal mode; title-derived label, heading level, indicator override. No wheel/key interception. | Static; nested scroll gestures/keyboard discoverability and clipped content need device checks. |
| inline-input | **Fixed** submitBehavior=submit followed by continued editing losing its blur commit. Change resets committed flag, submit updates comparison baseline. Existing immediate submit→blur dedup retained. | New stateful editor regression commits Before then After; foundation suite passed. Platform focus/submit event ordering still needs device coverage. |
| input | Controlled native props forwarded; editable and disabled combined; focus ring state composes user callbacks; semantic colors/ref preserved. | Foundation suite passed; no new dedicated assertion. Base minHeight 40 is below 44-point touch guidance; effective padded height/device target needs measurement. |
| input-group | Frame/addon/input slots preserve refs and props; child input fills width; addon alignment only changes padding as documented. | Foundation suite passed; no new dedicated assertion. Borderless child also removes Input's focus border; visible keyboard focus for the group needs a design/device follow-up. |
| input-otp | Numeric normalization on change, maxLength, one-time-code semantics, invalid announcement, root/ref forwarding. | Static; length accepts unrestricted number, so consumers must supply positive finite integer. Controlled value is not normalized; validation contract and autofill on devices remain unverified. |
| interactive-timeline | **Fixed** swallowing caller onLayout, event at end boundary positioned entirely past lane width, and NaN zoom poisoning geometry. Preserves category/selection state and callbacks; min 44-point event targets. | Two new tests: layout/end-event geometry and non-finite zoom controls. Overlapping events share lane position and can occlude each other; invalid dates/reversed ranges and out-of-range event policy are not solved. Needs real visual/gesture review. |
| item | Six exported slots use refs/display names; variants/size token-backed; media/actions don't hijack descendant interactions. | Foundation suite passed; no new dedicated assertion. Content gap uses half a spacing token (2pt), an existing design-scale deviation; not changed. |
| keyboard-shortcuts-help | Modal open/close ownership, reduced motion, safe-area injection, scrollable stable shortcut rows; explicitly guidance only, no global key listener. | Learning suite passed; no new dedicated assertion. Actual hardware shortcut implementation belongs to host; key glyphs/device reading order unverified. |
| label | Text props/nativeID/ref forwarded; disabled/invalid style; no false automatic focus behavior. | Foundation suite passed; no new dedicated assertion. Label-to-input mapping platform-dependent and caller-owned outside Field. |
| link | Host Pressable disabled, role link, textual child wrapping; onPress cancellation respected; injectable native linking with result/rejection callbacks. | Static; real URL opening not executed. No built-in pending UI; synchronous adapter throws/callback exceptions not contained. |
| list-box | Stable IDs; single replaces set, multiple toggles; combined root/item disabled; radio/checkbox checked state and visible check indicator. | Static; controlled single mode can receive multi-ID set, so valid controlled state remains host obligation. Native AT group semantics need device proof. |
| live-feed | Immutable sort newest-first, maxItems slice, controlled now disables interval; timer cleared on dependency change/unmount; newest title live region. | Data suite passed; no new dedicated assertion. Invalid timestamps render NaNd ago; non-finite tickMs can bypass intended 1-second minimum. Relative-time strings are English-only; no formatting callback. These input/localization boundary limitations remain open. |

## Verification

Environment: Node **v22.23.2**, Corepack **pnpm@9.15.4**. Commands run from repository root with:

```sh
export PATH=/Users/bntvllnt/.nvm/versions/node/v22.23.2/bin:$PATH
corepack pnpm@9.15.4 -F @vllnt/ui-native exec jest --runInBand \
  src/components/native-review-dl.test.tsx \
  src/components/foundation-form-native.test.tsx \
  src/components/learning-composites-native.test.tsx \
  src/components/interactive-data-content-native.test.tsx \
  src/components/data-native.test.tsx
```

Observed: **5 suites passed, 36 tests passed, 0 snapshots**. New suite: **9 passed**. After the combined run, the test resolver helper was adjusted only to satisfy lint; final narrow rerun of `src/components/native-review-dl.test.tsx` passed **9/9**, 1 suite, 0 snapshots.

```sh
corepack pnpm@9.15.4 -F @vllnt/ui-native exec eslint \
  src/components/native-review-dl.test.tsx \
  src/components/date-field/date-field.tsx \
  src/components/file-upload/file-upload.tsx \
  src/components/flashcard/flashcard.tsx \
  src/components/inline-input/inline-input.tsx \
  src/components/interactive-timeline/interactive-timeline.tsx
git diff --check
```

Observed: both exit **0**. No aggregate typecheck/build, CI, simulator, physical-device, screenshot, or assistive-technology checks performed. Parent must run aggregate gates and address remaining review/device risks before making release claims.

## Paths changed by this batch

- `packages/ui-native/src/components/date-field/date-field.tsx`
- `packages/ui-native/src/components/file-upload/file-upload.tsx`
- `packages/ui-native/src/components/flashcard/flashcard.tsx`
- `packages/ui-native/src/components/inline-input/inline-input.tsx`
- `packages/ui-native/src/components/interactive-timeline/interactive-timeline.tsx`
- `packages/ui-native/src/components/native-review-dl.test.tsx`
- `docs/PR506_NATIVE_REVIEW_DL.md`
