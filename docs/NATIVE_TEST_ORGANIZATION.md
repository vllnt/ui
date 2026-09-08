# Native test organization

Related to [PR #506](https://github.com/vllnt/ui/pull/506).

Web precedent: `packages/ui/src/components/button/` colocates implementation and tests; `packages/ui/src/lib/` keeps shared utilities separate. Native retains its flat kebab-case component folders and colocated `button/button-styles.ts`. Shared Native primitives and theme remain separate rather than imitating DOM architecture. No production modules, exports, registry entries, generated files, configurations, dependencies, or public import paths changed.

Before: 24 family/integration suites directly in `src/components/`, plus one task-named primitive suite. After: 24 descriptively named suites in `src/tests/`, plus the renamed colocated primitive suite. Component-specific future tests belong beside their implementations; current suites genuinely exercise multiple components and retain their helpers locally.

## Path map

All paths below are relative to `packages/ui-native/src/`. Historical review reports retain the commands actually executed; use this map when rerunning them. Existing suite/test labels retain coverage provenance (except the primitive suite's task-number label).

| Previous path | Current path |
| --- | --- |
| `components/advanced-forms-native.test.tsx` | `tests/advanced-forms.test.tsx` |
| `components/animation-utilities-native.test.tsx` | `tests/animation-utilities.test.tsx` |
| `components/components.test.tsx` | `tests/public-api.test.tsx` |
| `components/content-ai-utility-native.test.tsx` | `tests/content-ai-utility.test.tsx` |
| `components/core-controls-native.test.tsx` | `tests/core-controls.test.tsx` |
| `components/data-native.test.tsx` | `tests/data.test.tsx` |
| `components/foundation-form-native.test.tsx` | `tests/foundation-form.test.tsx` |
| `components/interactive-data-content-native.test.tsx` | `tests/interactive-data-content.test.tsx` |
| `components/learning-composites-native.test.tsx` | `tests/learning-composites.test.tsx` |
| `components/missing-family-coverage-native.test.tsx` | `tests/selection-and-filter-controls.test.tsx` |
| `components/motion-content-native.test.tsx` | `tests/motion-content.test.tsx` |
| `components/native-ai-components.test.tsx` | `tests/ai-components.test.tsx` |
| `components/native-review-ac.test.tsx` | `tests/action-and-content-contracts.test.tsx` |
| `components/native-review-dl.test.tsx` | `tests/form-and-learning-contracts.test.tsx` |
| `components/native-review-mr.test.tsx` | `tests/numeric-and-learning-contracts.test.tsx` |
| `components/native-review-sz-async.test.tsx` | `tests/async-lifecycle.test.tsx` |
| `components/native-review-sz-contracts.test.tsx` | `tests/input-and-compound-contracts.test.tsx` |
| `components/native-review-sz.test.tsx` | `tests/navigation-and-status-contracts.test.tsx` |
| `components/navigation-native.test.tsx` | `tests/navigation.test.tsx` |
| `components/overlays-native.test.tsx` | `tests/overlays.test.tsx` |
| `components/review-links.test.tsx` | `tests/link-services.test.tsx` |
| `components/review-motion.test.tsx` | `tests/motion-lifecycle.test.tsx` |
| `components/review-regressions-native.test.tsx` | `tests/accessibility-and-interaction.test.tsx` |
| `components/review-state.test.tsx` | `tests/controlled-state.test.tsx` |
| `primitives/interaction-core-task20.test.tsx` | `primitives/interaction-core.test.tsx` |

## Verification

- `pnpm -F @vllnt/ui-native generate:index:check`: passed, 171 component modules.
- `pnpm -F @vllnt/ui-native boundaries:check`: passed.
- `pnpm -F @vllnt/ui-native exec tsc --noEmit --project tsconfig.build.json`: passed.
- `pnpm -F @vllnt/ui-native lint`: passed after import sorting/formatting.
- `pnpm -F @vllnt/ui-native exec jest --listTests --runInBand`: 25 suites before and after.
- `pnpm -F @vllnt/ui-native test:once`: 24 suites passed, one failed; 208 tests passed, one failed, 209 total. No snapshots. Failure: overlapping file-picker selections in `tests/accessibility-and-interaction.test.tsx`.
- `pnpm -F @vllnt/ui-native typecheck`: six fixture errors: four missing clipboard `getText` implementations in `tests/action-and-content-contracts.test.tsx`; two zero-argument resolver calls in `tests/async-lifecycle.test.tsx`.
- Temporarily restored the exact pre-move test sources and original paths, reran full typecheck and the failing accessibility suite, then restored the relocation. Both reproduced the same failures at the original paths. These are baseline repair issues, not organization regressions; assertions were not weakened.
- Compared all 25 suite bodies against pre-move snapshots after normalizing import statements: unchanged except removal of the primitive suite's task-number label. No tests lost.
- `git diff --check`: passed. Repository text-reference audit found old names only in historical review evidence, now linked to this map.

Full workspace/Expo builds, aggregate gates, and device/accessibility evidence remain parent-owned. The existing test/type failures must be repaired before readiness; this report does not claim ship approval.

## Other edited paths

- `packages/ui-native/README.md`
- `docs/NATIVE_TEST_ORGANIZATION.md` (this report)
- `docs/PR506_NATIVE_REVIEW_AC.md`
- `docs/PR506_NATIVE_REVIEW_DL.md`
- `docs/PR506_NATIVE_REVIEW_MR.md`
- `docs/PR506_NATIVE_REVIEW_SZ.md`
- `docs/PR506_NATIVE_REVIEW_SZ_ASYNC.md`
- `docs/PR506_NATIVE_REVIEW_SZ_CONTRACTS.md`
- `docs/PR506_READINESS_REVIEW.md`

Review reports only gain a historical-path notice pointing here. Protected workflow and CHANGELOG edits and all pre-existing component repairs were left untouched. No commits, pushes, agents, or full builds were run. Task-board tools were unavailable in this worker session.
