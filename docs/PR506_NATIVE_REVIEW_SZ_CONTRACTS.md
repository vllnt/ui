# PR506 Native S–Z input and compound repairs

Test paths below record historical commands. See the [organization path map](NATIVE_TEST_ORGANIZATION.md) for current locations; assertions are preserved.

Related to https://github.com/vllnt/ui/pull/506.

## Delivered

- TagsInput: `disabled`, `editable={false}` and `readOnly` consistently lock draft changes, keyboard commits, add and remove actions. Commit compares normalized contents, not only length. Normalization remains commit-time; controlled caller data is not silently rewritten on mount.
- TimeField: text input mode permits the colon required by its existing strict HH:mm contract; no new digit auto-format behavior.
- TimePicker: validates actual 00:00–23:59 ranges. Invalid caller values display the placeholder and begin selection from empty (first hour/minute choice supplies 00 for the other part). No unsolicited change callback. Non-finite minuteStep falls back to the existing default 5; finite values retain floor/clamp behavior. Valid off-step caller minutes are not rounded.
- StepByStep: progress counts unique completed IDs that belong to current steps. Toggle callbacks continue preserving other caller IDs, including IDs for temporarily absent steps. Interactive roots preserve child View props, ref and caller style. Generic child acceptance is unchanged; this batch does not narrow that pre-existing API to Step-only children.
- Tabs: mounted triggers and selected panels register through context effects; generated relationships only emit for present counterparts, including through wrapper components. Removal clears registration. Stable IDs and selected-only panel mounting remain unchanged; tab values must be unique within the compound.
- TimelineScrubber: adjustable root is explicitly accessible; increment accessibility action tested. No drag behavior claimed.
- Tooltip: direct string/number trigger and content slots receive token-styled native Text, including numeric zero. Element slots are unchanged; nested scalar arrays/fragments remain caller-owned native composition.

No design-token changes or new motion, dependencies, shared files, original S–Z report/tests, workflows or changelog edits. The TimePicker edit preserves the prior agent's disabled-state fix.

## Verification

Node 22 via `/Users/bntvllnt/.local/bin`, corepack pnpm 9.15.4. From repository root:

```sh
PATH=/Users/bntvllnt/.local/bin:$PATH corepack pnpm@9.15.4 -F @vllnt/ui-native exec jest --runInBand src/components/native-review-sz-contracts.test.tsx src/components/native-review-sz.test.tsx src/components/review-state.test.tsx
PATH=/Users/bntvllnt/.local/bin:$PATH corepack pnpm@9.15.4 -F @vllnt/ui-native exec eslint src/components/{tags-input,time-field,time-picker,step-by-step,tabs,timeline-scrubber,tooltip}/*.tsx src/components/native-review-sz-contracts.test.tsx
git diff --check -- packages/ui-native/src/components/{tags-input,time-field,time-picker,step-by-step,tabs,timeline-scrubber,tooltip}
```

Final results: **3 suites passed, 26 tests passed**, including **13 new contract tests**; focused ESLint and whitespace checks exited 0. ESLint --fix previously applied repository formatting to owned files.

Red evidence: initial run had 11 failures / 2 passes, but four failures were ambiguous Tags label queries, not bug proof, and the initial undefined-prop matcher did not correctly prove Tabs absence. Those test issues were corrected. Restoring original Tags editable/length comparison behavior then produced 3 focused failures (editable=false, readOnly, same-length normalization); restoring original Tabs reference expressions produced 2 focused failures (missing and removed panels). Other initial failures directly demonstrated keyboard mode, invalid picker value/step, progress count, dropped Step props, missing accessible scrubber and raw Tooltip scalars. The final restored fixes pass all tests. Disabled Tags is preservation coverage, not claimed as independent red proof.

No builds, typecheck, aggregate workspace gates, device, screen-reader or visual checks were run (assignment restricts checks to focused tests/lint). Parent owns release gates and physical keyboard/VoiceOver/TalkBack verification. TimeField's prior invalid-blur display behavior remains outside this requested keyboard repair. Registration effects prove committed React-tree relationships, not native accessibility timing on devices.

Task-board tools were unavailable in this child session, so task #54 steps/status could not be posted or updated. Work completed locally; no commit/push.

## Files changed

- `packages/ui-native/src/components/tags-input/tags-input.tsx`
- `packages/ui-native/src/components/time-field/time-field.tsx`
- `packages/ui-native/src/components/time-picker/time-picker.tsx`
- `packages/ui-native/src/components/step-by-step/step-by-step.tsx`
- `packages/ui-native/src/components/tabs/tabs.tsx`
- `packages/ui-native/src/components/timeline-scrubber/timeline-scrubber.tsx`
- `packages/ui-native/src/components/tooltip/tooltip.tsx`
- `packages/ui-native/src/components/native-review-sz-contracts.test.tsx`
- `docs/PR506_NATIVE_REVIEW_SZ_CONTRACTS.md`
