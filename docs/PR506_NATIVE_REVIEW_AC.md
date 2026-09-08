# PR506 Native individual review: A–C

Test paths below record historical commands. See the [organization path map](NATIVE_TEST_ORGANIZATION.md) for current locations; assertions are preserved.

Related to https://github.com/vllnt/ui/pull/506.

## Scope and method

Individually read all **46 directories / 47 implementation files** beginning a, b, or c in `packages/ui-native/src/components` (18 A, 7 B, 21 C). Button includes `button-styles.ts`; every other directory has one TSX implementation. Reviewed public props/exports/ref forwarding, state ownership, events, disabled behavior, accessibility, effects/async cleanup, native fallbacks and token use. Read repository AGENTS, all four agent rule documents, DESIGN and tokens. No shared primitives, shared tests, barrel, dependency, CI, release, or unrelated edits. Task-board tools were unavailable; inventory → individual inspection → focused repairs/tests → evidence report was the executed plan.

**Static inspection is not runtime proof.** The per-directory table distinguishes the new named renderer assertions from static assessment. Jest uses React Native mocks, not Hermes, native layout, device keyboard, VoiceOver/TalkBack or pixels. No aggregate gates, device runs, visual tests, or CI inspection were performed. Ref wiring was inspected, not measured on native hosts. No design deviations introduced.

## Per-directory evidence

Paths below are relative to `packages/ui-native/src/components/`; each row covers the complete directory.

| Directory | Individual assessment / finding | New executed assertions or limitation |
|---|---|---|
| accordion | Controlled IDs and single/multiple toggle route through Collapsible; item refs target inner View, disclosure labels/conditional IDs inspected. | Static; simultaneous invalid default IDs in single mode not normalized. |
| activity-log | Finite positive page/page-size normalization, bounded derived page, empty controls omission and root ref inspected. | Static; pagination prose is English, labels only partially localizable. |
| agent-activity | Step detail splitting, controlled disclosure, status text and compound refs inspected. Fixed NaN/infinite progress and missing accessible progress node. | `keeps nonfinite agent progress %p out of native layout and a11y` (3 cases). Native announcement timing unverified. |
| ai-artifact | Every compound export inspected: callbacks hide when absent, value/filename context, version selected state, refs and plain content slots. | Static; consumer owns filesystem/download safety and async callback errors. |
| ai-chat-input | Submit-key and button share canSubmit; disabled/unavailable/submitting gates inspected. Fixed draft deletion when onSubmit is absent. | `preserves unsent composer text when no submit adapter exists`. Helper/status identical strings can duplicate React keys; localization is host-owned. |
| ai-message-bubble | Role-specific alignment/colors and string-to-Text wrapping, meta and bubble ref inspected. | Static; decorative avatar has iOS hiding only, Android duplicate-letter exposure requires follow-up. |
| ai-source-citation | Native Linking rejection callback and disabled Pressable, label/style/ref inspected. | Static; consumer owns URL allowlisting; optional error callback means no built-in failure UI. |
| ai-streaming-text | Plain text, stream-only cursor/live region and label/ref inspected; no timers. | Static; Android cursor hiding and announcement frequency need device verification. |
| ai-tool-call-display | Queued/running/complete/error badge mapping; independently expanded input/output text; no parser execution. | Static; status and section labels are English; defaultExpanded is deliberately initial only. |
| alert | Time-sensitive alert role, explicit live-region override, title/description refs inspected. | Static; grouped alert should not contain interactive descendants; actual announcements unverified. |
| alert-dialog | Controlled visibility, disabled confirmation, cancel/close reasons and reduced-motion ModalLayer path inspected. | Static; host owns async confirmation/loading and safe-area wrapper. |
| animated-list | Stable item keys, bounded negative delay, consumed animation and cleanup inspected. | Static; animationConsumed can prevent replay after effect cleanup during index changes/StrictMode; real animation interruption remains follow-up. |
| animated-tabs | Selected IDs and conditional panel references inspected. Fixed missing timing cleanup on change/unmount. | `stops tab selection animation on unmount`; mocked Animated only. Initial selection can be a disabled first tab. |
| animated-testimonials | Empty/single cases, ID fallback, bounded interval, pause/resume/manual-navigation pause, reduced-motion and effect cleanup inspected. | Static; consumed-animation StrictMode interruption and autoplay focus behavior require real-device proof. |
| animated-text | Grapheme segmentation, deterministic reveal order, completion ref, parallel cleanup and hidden visual segments inspected. | Static; word splitting drops leading whitespace; Intl.Segmenter Hermes availability and initial preference-triggered motion need platform validation. |
| aspect-ratio | Small View wrapper with forwarded ref/props and caller style precedence. | Static; invalid nonpositive/nonfinite ratios remain caller responsibility. |
| avatar | Loaded context, source-change cleanup, fallback condition and composed onLoad/onError/ref inspected. | Static; failed Image remains mounted despite TSDoc saying removed; stale native source events and fallback layering need device proof. |
| avatar-group | Source-specific failure fallback, stable IDs, size/overlap and overflow labels inspected. | Static; max accepts NaN/fractions; source equality is identity-based. |
| badge | All four shared variants and native text/root refs/styles inspected, no interactive semantics added. | Static; children are rendered inside Text, so consumers must supply text-compatible content. |
| banner | Dismiss state and callback, disabled action semantics and render-function children inspected. | Static; BannerAction only has 32-point minimum height; body needs native Text and host contrast for destructive variant. |
| blur-reveal | Reduced-motion opacity and animation cleanup inspected. Fixed invisible content intercepting touches by setting pointerEvents=none while hidden. | `disables hidden reveal hit testing and restores caller pointer policy`; native hit-test proof still needed. |
| bottom-bar | Leading/center/trailing slots, ref and safe-area wrapper inspected. | Static; safe area is host-owned and long center content can crowd edges. |
| breadcrumb | Current noninteractive segment, disabled links, optional navigation and Linking rejection callbacks inspected. | Static; supplying both href and onNavigate performs both actions; consumer must avoid duplicate navigation. |
| button | Both TSX and button-styles.ts inspected: all sizes/variants, 44-point controls, disabled state merge, string/number children and ref. | Static; external keyboard focus appearance unverified. |
| button-group | Orientation, gap, label and transparent child semantics/ref forwarding inspected. | Static; host owns wrapping/overflow and child disabled state. |
| calendar | Month day construction/leap-month count, controlled date/month, per-day disabled/selected state and labels inspected. | Static; invalid Date and years 0–99 are not normalized; keyboard/date-grid behavior needs device proof. |
| callout | Fixed accessible title-only parent hiding body/descendant actions; title retains its own accessible label, root no longer forces grouping. | `does not collapse callout body and nested actions into a title-only accessible node`; actual screen-reader traversal unverified. |
| card | All six exports, token colors/padding, header title role and ref/style composition inspected. | Static; no effects or state. |
| carousel | Paging width, ID fallback, loop bounds, accessibility increment/decrement and hidden inactive slides inspected. | Static residual: controlled swipe rejected by parent can leave ScrollView on new slide because unchanged selectedIndex does not retrigger scroll effect. Requires follow-up native-scroll regression. |
| category-filter | Exact categories→items delegation, selection/disabled/label/ref pass-through inspected. | Static; SegmentedControl implementation belongs to another batch. |
| chain-of-thought | Stable steps, explicit status text (not color alone), hidden markers, ordered layout and ref inspected. | Static; status change announcement/device grouping not verified. |
| checkbox | Controlled/uncontrolled and indeterminate→true behavior, mixed state, disabled Pressable and cancellable onPress inspected. | Static; caller must provide accessible label. |
| checkbox-group | Set-based immutable toggle, group/item disabled combination, radio-independent checkbox roles and orientation inspected. | Static; native grouping/marker announcements unverified. |
| checklist | Fixed stale uncontrolled IDs after items removal corrupting progress/completion/callbacks; progress node made accessible. | `filters removed uncontrolled checklist ids before progress and completion`. Duplicate item IDs remain invalid host data. |
| code-block | Plain selectable code and host syntax/clipboard boundary inspected. Added request generation invalidation for code/adapter changes, concurrent copies and unmount. | `does not notify code copy success after unmount`. Built-in error UI remains absent; host should supply onCopyError. |
| collapsible | Context guard, controlled state, conditional IDs and unmounted closed body inspected. Fixed animation cleanup when closed/unmounted. | `stops disclosure animation when closed`; no native animation pixels. Trigger-less composition can still create dangling labelledby. |
| color-picker | Preset-only contract, stable IDs, selected/disabled radio semantics and token chrome inspected. | Static; host owns arbitrary swatch colors and contrast. |
| combobox | Query/keyword filtering, close/reset, selected label, disabled options and keyboard-persistent taps inspected. | Static residual: changing global disabled while modal is open does not disable options. Modal focus restoration belongs to shared primitive/device verification. |
| command | Controlled open/query/selection and action callbacks inspected. Fixed ScrollView swallowing first item tap while search keyboard is open. | `keeps command actions tappable while the search keyboard is open` asserts prop policy only; physical keyboard proof pending. |
| completion-dialog | Confirm/cancel and close reasons, controlled visibility and ref inspected. Fixed plain string/number descriptions rendered directly in View, including zero. | `wraps completion dialog description %p in native Text` (2 cases). Safe-area/escape via shared primitive not independently proven. |
| content-intro | Section keys/index callbacks, known completed-count filtering, slots and refs inspected. | Static; isLoading suppresses progress display, not navigation; progress prose remains English. |
| context-menu | Controlled modal, disabled/destructive actions, onSelect and cancellation paths inspected. | Static; caller owns long-press trigger and safe-area integration. |
| conversation-thread | All eight exports inspected: message IDs, feedback/retry IDs, scroll threshold and instant bottom scrolling, suggestion sends and loading/empty conditions. | Static; loading only appears after an assistant message exists; suggestion send without onSend is inert and still enabled. onSend naming contract inherited from this Native API needs owner review. |
| copy-button | Added operation generation invalidation across reset/adapter change/unmount/concurrent requests; clear old timers before new request; bounded timeout. | `does not schedule a reset after clipboard completion following unmount`; `ignores stale clipboard success after a newer failure`; `invalidates a pending clipboard operation on reset`. Actual clipboard is injected mock. |
| countdown-timer | Date validity, fixed now, bounded tick interval, cleanup, warning and progress calculations inspected. | Static; live ticking continues after breach; changing fixed to live can briefly show stale stored timestamp. |
| credit-badge | All status label/variant mappings, amount composition, accessible label and ref delegation inspected. | Static; no async or interaction behavior. |

## Validation

Environment: Node **v22.23.2**, `corepack pnpm@9.15.4`.

- Focused Jest: `corepack pnpm@9.15.4 -F @vllnt/ui-native exec jest --runInBand src/components/native-review-ac.test.tsx` → **16/16 passed**. Initial run exposed missing accessible progress nodes (repaired) and a fake-timer microtask counting issue (assertion narrowed to setTimeout scheduling).
- Changed-source/test ESLint run (11 owned component directories + unique test) → passed after formatting and removing test-only non-null assertion.
- Additional bounded existing suites: native-ai-components and motion-content-native passed. First combined run: **48 passed / 2 failed / 50**. One failure was Callout title-label compatibility; restored label on title Text without restoring inaccessible parent grouping. Other failure is existing concurrent FileUpload expectation in `review-regressions-native.test.tsx:221`, outside A–C ownership and subject to another batch's concurrent edits. Shared test not modified.
- Final narrow rerun: `corepack pnpm@9.15.4 -F @vllnt/ui-native exec jest --runInBand src/components/native-review-ac.test.tsx src/components/native-ai-components.test.tsx src/components/motion-content-native.test.tsx src/components/content-ai-utility-native.test.tsx` → **4 suites / 36 tests passed**, including all **16 new assertions**. Final changed-file ESLint and `git diff --check` also passed. No before-fix checkout/revert run was performed; regression relevance is supported by inspected old source, not claimed red/green baseline execution.

## Remaining release limitations

This is a completed inventory audit, **not** an all-clear: residual issues are explicit in the table. Parent must triage controlled Carousel rejection, open Combobox disabled transition, animated-text whitespace/platform behavior, interrupted entrance animations, and device accessibility/keyboard/visual evidence. Existing static limitations are not silently certified by 16 tests. Shared tests and aggregate type/build gates remain parent-owned. Existing dirty workflow/CHANGELOG/primitives changes preserved; no commits/pushes.
