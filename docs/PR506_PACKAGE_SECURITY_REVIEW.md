# PR #506 package/security review

PR: https://github.com/vllnt/ui/pull/506

Reviewed base `origin/main...HEAD`, HEAD `811451e3cb223f8513e069f3dfee4471fb65d126`, plus the existing dirty tree. This is a bounded package/build/security review, not a repeat of the Native component or registry/web audits. Parent owns task tracking (no task tool was exposed in this child).

## Finding and repair

The Native boundary checker rejected `@vllnt/ui` but accepted web-only subpaths such as `@vllnt/ui/styles.css` and `@vllnt/ui/themes/default.css`. Added the missing subpath prefix and an isolated fixture regression; the normal `boundaries:check` command now runs that regression before scanning source. No dependencies added.

- Regression run against the original HEAD checker: **failed as expected**, `@vllnt/ui/styles.css`, expected exit 1, actual 0.
- `pnpm -F @vllnt/ui-native boundaries:check`: **passed**, 1 test; current Native source boundary passed. Fixture also verifies core/native imports are not rejected.
- `git diff --check` for owned edits: passed.

## Per-file inventory and evidence

All paths below are repository-relative. Grouped rows explicitly enumerate each reviewed file.

| Files | Review performed / result |
|---|---|
| `.github/workflows/ci.yml` | Full workflow and base diff: PR jobs have contents-read only, frozen install, Node 22; new Native job calls bounded quality pipeline, not publishing. |
| `.github/workflows/native-canary.yml` | Full current workflow and dirty diff, **read-only**. Main-push only; variable opt-in, named environment, dependent quality job, publish-only OIDC permission; fixed package names and quoted environment-derived values; staging and guarded rollback reviewed below. |
| `package.json` | Changed scripts, dev dependency and override review: Native pipeline includes tokens/index drift, lint/types/build/tests/boundaries/packs/Expo. Madge is dev-only; ws security override retained. |
| `pnpm-lock.yaml` | Importer diff and complete added-line scan for remote tarball/git/file sources (none added). Native React 19.2.3/RN 0.86.3, Expo 57; core has no runtime deps, native only core plus peers. Large transitive snapshot churn is not a third-party source-code or vulnerability audit. |
| `.gitignore`, `doctor.config.json`, `ntk.yaml` | Diff: Expo output ignore; doctor blocking key/custom wrappers; preview dependency path expansion. No new credentials or execution interpolation. |
| `packages/design/README.md`, `packages/design/package.json` | Private authored-source package, deterministic generate/check commands; no publish path. |
| `packages/design/component-contracts.json`, `packages/design/component-contracts.schema.json` | Complete source/schema: explicit portable option lists, heading bounds, uniqueness and additional-property controls. |
| `packages/design/tokens.json`, `packages/design/tokens.schema.json` | Complete authored tokens/schema: OKLCH source, lengths, typography, duration and semantic names. Schema is documentation, generator performs its own partial validation, not full schema evaluation. |
| `packages/design/scripts/generate-tokens.mjs` | Full script: fixed output paths; JSON serialization of TS data, marker-scoped CSS replacement, deterministic color/point conversions and contrast checks; check mode does not write. Inputs are trusted repository data, not an untrusted CSS ingestion API. |
| `packages/ui-core/component-contracts.json`, `packages/ui-core/component-contracts.schema.json`, `packages/ui-core/tokens.json`, `packages/ui-core/tokens.schema.json`, `packages/ui-core/src/generated/design-tokens.ts` | Generated artifacts verified by read-only generator against reviewed canonical sources; not manually edited or claimed as separate handwritten implementations. |
| `packages/ui-core/CHANGELOG.md`, `packages/ui-core/README.md` | Explicit experimental/source-only availability and planned synchronized publication; exports described consistently. |
| `packages/ui-core/package.json`, `packages/ui-core/tsup.config.ts`, `packages/ui-core/tsconfig.json`, `packages/ui-core/tsconfig.build.json` | Source development entries replaced by dist in actual pnpm tarball; ESM-only, framework-free bundle; build excludes tests; types checked in independent consumer. |
| `packages/ui-core/eslint.config.js`, `packages/ui-core/vitest.config.ts` | Node lint and Node test environment; generated/scripts excluded from lint (reviewed directly). |
| `packages/ui-core/src/index.ts`, `packages/ui-core/src/platform.ts`, `packages/ui-core/src/theme.ts`, `packages/ui-core/src/theme.test.ts` | Complete exports/platform guard/theme merge/contrast tests. Semantic partial overrides preserve base fields. Readonly types are not runtime deep freezing; inputs are caller-owned typed configuration. |
| `packages/ui-core/scripts/check-packed-package.mjs` | Fixed cwd, spawn argument arrays, temporary extraction cleanup and public target existence; this check alone does not establish consumer resolution (independent proof below). |
| `packages/ui-native/CHANGELOG.md`, `packages/ui-native/README.md` | Current docs including dirty README read-only; source availability, injectable host services and device gates remain explicit. |
| `packages/ui-native/package.json`, `packages/ui-native/tsup.config.ts`, `packages/ui-native/tsconfig.json`, `packages/ui-native/tsconfig.build.json` | Full manifests/config: React and RN external peers, core external dependency, bundled ESM/declarations. Published Native condition and legacy field target dist. Only owned package-script edit described above. |
| `packages/ui-native/babel.config.cjs`, `packages/ui-native/eslint.config.js`, `packages/ui-native/jest.config.cjs`, `packages/ui-native/jest.setup.cjs` | Preset versions, lint exceptions and test mapping reviewed. Jest maps core to source and mocks reduced motion, so unit success is not packed or real-device evidence. |
| `packages/ui-native/registry.json`, `packages/ui-native/registry.schema.json` | Metadata/schema checked: 171 entries, every declared source exists, compatibility values valid, installation unavailable, source-only, peers match manifest. Individual component implementations not re-audited. |
| `packages/ui-native/scripts/check-boundaries.mjs`, `packages/ui-native/scripts/check-boundaries.test.mjs` | Full checker and new regression reviewed; subpath bypass repaired. Text scan is a guardrail, not an AST security sandbox. |
| `packages/ui-native/scripts/check-packed-package.mjs` | Full script: dist/condition existence and rewritten workspace range; safely isolated temp cleanup. Independent consumer covers missing resolution evidence. |
| `packages/ui-native/scripts/generate-index.mjs`, `packages/ui-native/src/index.ts` | Generator read fully, generated barrel verified against every sorted source directory and manifest; 171 modules current. |
| `packages/ui-native/src/primitives/modal-layer.tsx`, `packages/ui-native/src/primitives/platform-services.ts`, `packages/ui-native/src/primitives/selection.ts`, `packages/ui-native/src/primitives/use-controllable-state.ts`, `packages/ui-native/src/primitives/use-reduced-motion.ts`, `packages/ui-native/src/theme/theme-provider.tsx` | Shared contracts reviewed: hardware back/escape and caller safe area, explicit clipboard/file-picker injection, native Linking/Share adapters, immutable selection-set updates, controlled notifications, reduced-motion listener cleanup/stale query protection, system theme fallback. URL scheme authorization belongs to host linking adapter when content is untrusted; adapter intentionally supports native deep links. |
| `apps/native-catalog/metro.config.cjs` | Default Expo config only; read as resolution context, not a catalog implementation audit. |
| `docs/RELEASING.md`, `docs/ARCHITECTURE.md`, `CHANGELOG.md` | Changed release/architecture text reviewed; dirty root changelog read-only. Release setup documentation lacks the newly required dist-tag credential (see below). |

Native component tests and the moved interaction test are owned by the Native audit and were not re-reviewed. Registry/web implementations are owned by the other worker and untouched. Root contributor/roadmap/catalog implementation prose is not included in this package security claim.

## Actual isolated packed consumer

Environment: Node **22.23.2**, Corepack pnpm **9.15.4**. The ambient `pnpm` binary is 11.20.0; initial core build failed because nested scripts reached that binary. A temporary PATH shim forwarding pnpm to Node-22 Corepack fixed the tool selection; no repository tooling settings changed.

Fresh core and Native package builds then passed (core JS 12.40 KB, declarations 19.31 KB; Native JS 672.84 KB, declarations 204.54 KB). These are package artifact builds, not aggregate workspace gates.

Consumer: `/tmp/pr506-isolated-consumer.nsTXO0` (outside repository). Both actual tarballs were made with `pnpm --dir packages/<package> pack --pack-destination <consumer>`. The consumer uses `file:./vllnt-ui-*.tgz` dependencies and a **consumer-only** core override to the packed core artifact, because unpublished core 0.1.0 cannot be fetched from npm. The packed Native dependency itself is the normal rewritten `0.1.0`, not a workspace dependency.

Tarball SHA-256 after fresh builds:

- core: `13e2ca3ea16697fc7a42cd5b7052ba32d16f5a992f6ff032b0514e065d358233`
- native: `ba3a49901e687787cd76dc4cf0a509b09f94284dcd6d1ae082b46541c0810bbd`

The consumer node_modules and lock were removed before the final install; final commands:

```sh
COREPACK_ENABLE_NETWORK=0 pnpm install --offline --ignore-scripts --config.auto-install-peers=false
node check.mjs
pnpm exec tsc consumer.tsx --noEmit --strict --skipLibCheck false --jsx react-jsx --target es2022 --lib es2022 --module esnext --moduleResolution bundler --types react,react-native
pnpm exec tsc consumer.tsx --noEmit --strict --skipLibCheck false --jsx react-jsx --target es2022 --lib es2022 --module nodenext --moduleResolution nodenext --types react,react-native
```

All **passed**. Install: 226 packages, cached registry dependencies plus local tarballs, no install scripts. pnpm reports local tarball ingestion in its downloaded counter; command was explicitly offline. Consumer dependencies: React 19.2.3, RN 0.86.3, @types/react 19.2.13, TS 5.9.3, metro-resolver 0.84.4. No new repository dependencies.

`consumer.tsx` imports Native Button/ThemeProvider/ButtonProps and full namespace, core theme and portable variant types; strict TS validates the complete bundled declarations with skipLibCheck **false**, no workspace paths/shared tsconfig.

`check.mjs` results:

- Core runtime theme/platform guard assertions passed.
- Node ESM root import resolution for both packages points to **consumer-local `.pnpm/.../dist/index.js`**, verified with realpath (not a monorepo link).
- Core token/contracts JSON and Native registry subpaths exist through package exports.
- Actual Metro resolver resolves Native and its transitive core import to dist on **iOS and Android**, both **exports enabled and disabled** (four combinations passed). Legacy `react-native` field therefore works independently of conditional exports.

Additional focused checks: token drift passed, generated index current (171), manifest source existence passed, boundary regression/current-source scan passed.

## Security and release limits

- Current workflow dirty fix correctly distinguishes OIDC publication from token-authenticated dist-tag management and fails before publishing when `NPM_DIST_TAG_TOKEN` is absent. **Owner follow-up:** document required least-privileged token/environment secret in `docs/RELEASING.md`; current instructions mention only trusted publisher, package reservation and environment. Protected workflow and changelog were not overwritten.
- Publication is not atomic across npm packages. EXIT rollback covers ordinary process failures, not SIGKILL/runner loss; already-published immutable versions remain. Tag reads and writes have an external-racer gap despite owner checks; GitHub concurrency serializes this workflow only. No live registry mutation or rollback drill performed.
- Actions use version tags rather than immutable SHAs; npm CLI is version-pinned but installed at workflow runtime. Dependency integrity in the lock is not a supply-chain attestation of all transitive code.
- No credentials read, printed, tested, or changed. Repository variable, environment protections, npm name ownership, OIDC mapping, token rights and actual publishing remain **unverified**. No publication/network secret use/commit/push/deploy/merge.
- Isolated consumer proves packed types/import/Metro entry resolution, **not** a full isolated Metro transformation/bundle or native runtime rendering. No physical device, VoiceOver/TalkBack or RN-minimum-0.81 matrix test. Native runtime cannot be meaningfully executed as an ordinary Node module; only core executed under Node. Existing catalog/device evidence must be supplied separately.
- No aggregate gates rerun. Other workers' dirty changes preserved. This report does not claim the whole PR is ready to release.
