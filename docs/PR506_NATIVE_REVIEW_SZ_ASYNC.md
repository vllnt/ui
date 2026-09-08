# PR506 Native S–Z async lifecycle repairs

Test paths below record historical commands. See the [organization path map](NATIVE_TEST_ORGANIZATION.md) for current locations; assertions are preserved.

Related to https://github.com/vllnt/ui/pull/506.

## Scope and result

Task #53: repaired only SearchDialog, ShareDialog, ShareSection, Terminal and Toast, with a separate regression suite. Original S–Z review/test, shared primitives, workflows, CHANGELOG and other agents' work were not edited. Root instructions, all four agent rule documents, DESIGN and machine-readable tokens were read. No visual token/design deviation introduced.

- **SearchDialog:** results are keyed by service identity as well as query. Replacement services no longer expose the prior service's cached result while loading. Layout-effect cleanup invalidates requests on dependency changes and unmount; existing superseded-query handling is retained.
- **ShareDialog:** synchronous pending lock prevents same-render duplicate native shares. Busy/disabled accessibility state reflects pending work. Closing, controlled visibility changes, service changes and unmount invalidate result/error callbacks and the automatic close. An old share cannot close a reopened dialog.
- **ShareSection:** synchronous pending lock, busy recovery and service/unmount invalidation. Result/error callbacks are suppressed for an invalidated operation.
- **Terminal:** synchronous clipboard lock and busy/disabled semantics. Command, adapter, copyable and unmount changes invalidate completion feedback/callbacks. Pending writes cannot overwrite newer copied feedback or report stale success/error. Commands-only copying remains unchanged.
- **Toast:** duration changes replace the timer; omitted/nonpositive duration cancels it, and unchanged durations retain their existing deadline. Timer and manual dismissals synchronously accumulate against the latest queue. Dismissed IDs remain suppressed through intermediate controlled updates until the owner removes them, preventing resurrection and restarted timers. Reusing an ID after an observed removal works. Removed entries/unmount still clear timers.

Small private component-specific hooks keep ShareSection/Terminal within the repository's function-length gate; no shared lifecycle abstraction or dependency added.

## Contract choices

Platform service interfaces expose promises, not cancellation. Requests/writes already started cannot be physically cancelled. Share/clipboard controls remain locked until that promise settles, even after a service/content session changes, avoiding overlapping external operations; stale completion then unlocks the current mounted control without delivering stale callbacks. Host-owned operations that must survive unmount should be observed in the host service, not component callbacks.

Toast's owner still controls rendered entries; the component does not optimistically hide a rejected dismissal. It does remember requested removals when calculating subsequent callbacks. An ID must be removed in a committed owner update before it can represent a new notification. Duration-change and ID-reuse semantics are documented in the component's public TSDoc.

No unresolved decision blocks the assigned repairs. Search rejection still uses the existing empty-results presentation: introducing a distinct localized error/retry API is outside this lifecycle repair. The unmount search smoke test proves safe settlement/new-instance isolation, not physical request cancellation or direct observation of React's discarded state update; invalidation is also verified by source inspection.

## Verification

Environment: `/Users/bntvllnt/.local/bin/node` **v22.23.2**, `corepack pnpm@9.15.4`.

Before implementation changes, the new focused suite reported **15 failed, 3 passed, 18 total**. Failures demonstrated service-cache staleness, share/clipboard duplication and stale callbacks, and toast duration/dismissal races. The three existing-behavior passes covered superseded search sessions, share-error recovery and toast unmount cleanup. Two additional lifecycle coverage tests were added afterward.

Final commands from repository root:

```sh
PATH=/Users/bntvllnt/.local/bin:$PATH corepack pnpm@9.15.4 -F @vllnt/ui-native exec eslint src/components/{search-dialog/search-dialog,share-dialog/share-dialog,share-section/share-section,terminal/terminal,toast/toast,native-review-sz-async.test}.tsx --fix
PATH=/Users/bntvllnt/.local/bin:$PATH corepack pnpm@9.15.4 -F @vllnt/ui-native exec jest --runInBand src/components/native-review-sz-async.test.tsx src/components/overlays-native.test.tsx src/components/motion-content-native.test.tsx src/components/learning-composites-native.test.tsx
```

Result: **ESLint passed; 4 suites passed, 38 tests passed, 0 snapshots** (20 new regressions, 18 existing integration tests). Scoped `git diff --check` passed. No builds, typecheck, aggregate workspace gates, device/assistive-technology or visual checks run, as assigned; these remain parent-owned release evidence, not claimed here. No commit/push/dependency changes.

Task-board tooling was not exposed in this child session, so board steps/status could not be posted. Inspection, failing regression proof, repairs and focused verification are complete.

## Exact edited/written paths

- `packages/ui-native/src/components/search-dialog/search-dialog.tsx`
- `packages/ui-native/src/components/share-dialog/share-dialog.tsx`
- `packages/ui-native/src/components/share-section/share-section.tsx`
- `packages/ui-native/src/components/terminal/terminal.tsx`
- `packages/ui-native/src/components/toast/toast.tsx`
- `packages/ui-native/src/components/native-review-sz-async.test.tsx`
- `docs/PR506_NATIVE_REVIEW_SZ_ASYNC.md`
