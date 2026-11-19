# VLLNT UI native catalog

Private Expo integration consumer for the experimental, source-only `@vllnt/ui-native` renderer. It exercises representative foundation, form, data, feedback, navigation, overlay, AI, learning, motion, and theme surfaces from the package barrel.

```bash
pnpm -F @vllnt/ui-native-catalog dev
pnpm -F @vllnt/ui-native-catalog lint
pnpm -F @vllnt/ui-native-catalog typecheck
pnpm -F @vllnt/ui-native-catalog test:once
pnpm -F @vllnt/ui-native-catalog build
```

The app has two views, chosen with the View buttons. **Highlights** is the representative interaction sample. **All components** renders one example of every module in `packages/ui-native/registry.json` under a heading with its registry name, so one scroll covers the device pass (iOS and Android, VoiceOver and TalkBack). The examples are the fixtures in `packages/ui-native/src/tests/accessibility-fixtures.tsx` that the accessibility contract test renders. They stay out of the npm package, which ships `dist` and metadata only. Examples that open a native modal on mount start hidden behind a **Show** button, because a list cannot show several full-screen modals at once. `all-components.test.tsx` fails when a registry entry has no fixture or another fixture opens a modal on mount.

The build exports Android and iOS JavaScript bundles in CI. This validates Expo/Metro workspace resolution without publishing or requiring a simulator. It does not replace physical Android/iOS, VoiceOver, or TalkBack validation.

`@vllnt/ui-native` is not available from npm yet. The catalog consumes repository source and must stay aligned with `packages/ui-native/registry.json` and the generated package barrel.

## Validate a published pair

`scripts/verify-published.mjs` checks the pair that is on npm, not the workspace. Run it for every canary and for the 0.1.0 release candidate:

```bash
node apps/native-catalog/scripts/verify-published.mjs 0.1.0-canary.20260917105553.sha7466647a4ba5
node apps/native-catalog/scripts/verify-published.mjs canary    # a dist-tag of @vllnt/ui-native
node apps/native-catalog/scripts/verify-published.mjs <version> --only catalog --keep
```

It resolves the version, checks `@vllnt/ui-core` and `@vllnt/ui-native` both exist at that exact version, and that ui-native depends on exactly that ui-core. Then it installs the pair with pnpm into two consumers under `~/.cache/ui/verify-published/` (`$RUNNER_TEMP` in CI), outside the workspace, so nothing resolves through workspace links or hoisting:

| Consumer    | What it is                                                                                  | Steps                                                                |
| ----------- | ------------------------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| `clean-app` | A minimal Expo app: `App.tsx` imports `@vllnt/ui-native`, wraps in `ThemeProvider`, renders a few components | install, pair on disk, typecheck, `expo export` iOS and Android      |
| `catalog`   | A copy of this app plus the fixtures and accessibility tests it imports                      | install, pair on disk, prepare, typecheck, Jest, `expo export` iOS and Android |

- **Pins.** expo, react, react-dom, react-native, react-native-web, jest, `@testing-library/react-native` and typescript (plus expo-status-bar, react-test-renderer, the `@types`, and `@react-native/jest-preset` at the react-native version) are the exact versions `pnpm-lock.yaml` resolves for this app today. The lockfile is only read.
- **Supply chain.** Each scratch project gets its own `pnpm-workspace.yaml` that copies `minimumReleaseAge` and `minimumReleaseAgeExclude` from the root one at run time, with `@vllnt/*` added to the exclude list. Installs run with `--ignore-scripts`. The root file is only read.
- **Catalog copy.** Relative imports of package source (`../index`, `../components/...`, `../../packages/ui-native/src/tests/...`, `registry.json`) are rewritten to `@vllnt/ui-native`. Jest runs against the installed package: the copied `jest.config.cjs` is derived from this app's, minus its `moduleNameMapper` to source, and with `@vllnt/ui-core` added next to `@vllnt/ui-native` in `transformIgnorePatterns` (both ship ESM). Resolution of `@vllnt/ui-core` still goes through its own `exports` map; nothing is mapped. The three accessibility tests (`accessibility-contract`, `accessibility-and-interaction`, `accessibility-regressions`) are copied when every name they import is exported by the published package. When a test needs something that is not (a deep component path, `ModalLayer`, a `jest.mock` of an internal), it is listed as `SKIP` with the names, not copied and not counted as a pass. A type the package does not export is replaced by a local `any` alias and reported in the `prepare` row.
- **Output.** A PASS/FAIL/SKIP table per consumer and step (also written to the job summary in CI). The exit code is non-zero when any step is FAIL. The scratch directory is deleted at the end; `--keep` keeps it when something failed.

In CI it runs in two places, both read-only (`contents: read`, no environment, no token, no secret):

- **Every canary.** The `verify-published` job in `.github/workflows/native-canary.yml` runs after `native-publish` succeeds, on the commit that was pushed. It recomputes the version `native-publish` used (`scripts/release-guard.mjs native-canary`) and checks it is on npm (`scripts/npm-published.sh`). `publish-canary.sh` stands down without publishing when main has moved on and still succeeds; then the version is not on npm and the job is a no-op. Any other registry answer fails the job. A failing verify fails the canary run, so the native health alert reports it.
- **By hand.** `.github/workflows/native-verify-published.yml` is `workflow_dispatch` only, with a `version` input, for a release candidate or to repeat a canary check. It has no other trigger and no ref override. The catalog sources and tests under test come from the checked-out ref, so dispatch it from the commit or tag the pair was built from.

What it does not cover: physical iOS or Android devices, VoiceOver and TalkBack, and visual review. `expo export` proves the bundles resolve and build, not that they look right. Transitive dependencies are resolved fresh (no lockfile), so a very new patch of a transitive package can differ from what the workspace tests with. Unit tests for the script's parsers and import rewriter: `node --test apps/native-catalog/scripts/verify-published.test.mjs`.
