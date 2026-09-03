# Architecture

## Monorepo layout

```text
vllnt/ui/
├── packages/
│   ├── design/              # authored tokens + portable contracts + generator
│   ├── ui-core/             # @vllnt/ui-core — generated, platform-neutral data
│   ├── ui/                  # @vllnt/ui — stable React DOM renderer
│   └── ui-native/           # @vllnt/ui-native — experimental RN renderer
├── apps/
│   ├── registry/            # Next.js docs + platform-aware registry
│   └── native-catalog/      # private Expo integration consumer
├── .github/workflows/
├── specs/
└── docs/
```

## Package boundaries

| Package | Purpose | Release policy |
|---------|---------|----------------|
| `@vllnt/ui` | React DOM components using Radix UI, Tailwind CSS, and CVA | Public `latest` + canary |
| `@vllnt/ui-core` | Framework-free tokens, native theme values, and portable option contracts | Experimental canary only |
| `@vllnt/ui-native` | React Native components using native primitives and `StyleSheet` | Experimental canary only |
| `@vllnt/ui-registry` | Docs, shadcn feed, search, and MCP | Private; deployed |
| `@vllnt/ui-native-catalog` | Expo integration and Metro bundle proof | Private; CI only |

`@vllnt/ui` does not depend on the experimental packages. Its exports, CSS entry points, DOM behavior, and stable release path remain unchanged. The native renderer depends on `@vllnt/ui-core`, never on the web renderer. The registry is the first private consumer of core metadata.

External contributor tooling still comes from `@vllnt/eslint-config` and `@vllnt/typescript`. The web renderer uses React 19, Radix UI, Tailwind CSS, and CVA; the native renderer uses React 19 and React Native primitives. `tsup` builds libraries, Next.js builds the registry, and Expo/Metro validates the native integration.

## Shared foundations

`packages/design/tokens.json` is the authored token source. `packages/design/component-contracts.json` contains only portable semantic options such as Button variants, Text scales, and Heading levels. It deliberately excludes renderer details such as DOM attributes, `className`, `onClick`, React Native `style`, and `onPress`.

The token generator writes committed artifacts for deterministic builds:

- Existing `packages/ui/themes/default.css` and the token region of `packages/ui/styles.css`.
- `@vllnt/ui-core` TypeScript and JSON exports.
- React Native-compatible sRGB colors and point-based spacing, radius, type, and motion values.

```bash
pnpm tokens:generate
pnpm tokens:check
```

CI runs the read-only drift check. A token change is incomplete when generated web and core outputs disagree.

## Renderer model

### Web

`@vllnt/ui` targets React 19. Components render semantic DOM and Radix primitives, use Tailwind/CVA recipes, and accept refs as normal React 19 props. Existing package and CSS subpaths remain the supported contract.

Web components remain self-contained under `packages/ui/src/components/{name}` with implementation, unit test, visual fixture, MDX documentation, and barrel export files as applicable. The root `src/index.ts` remains the public barrel. `pnpm check:circular` runs Madge against this graph.

### React Native

`@vllnt/ui-native` targets React 19 and React Native 0.81 or newer. The pilot includes Button, Text, Heading, Badge, and the Card compound family. Components consume the generated theme through `ThemeProvider`, expose React Native props, meet native touch-target and accessibility requirements, and have no DOM, Radix, Tailwind, or NativeWind dependency.

NativeWind and `@rn-primitives` are intentionally absent from the foundational pilot. This avoids mandatory consumer Babel configuration and unnecessary runtime dependencies. Complex interaction families can add narrowly scoped adapters after real-device validation proves the need.

## Theming

Web colors remain OKLCH channel CSS variables on `:root` and `.dark`; spacing, radius, and typography also remain CSS variables. The Tailwind preset and runtime preset themes continue to consume those variables, so downstream overrides do not require component patches.

Core generation converts the authored OKLCH values to clipped sRGB hex for React Native and converts rem-based dimensions to numeric points. It applies two documented native accessibility adjustments: a near-black dark background instead of banned pure black, and a darker light destructive surface so small labels meet 4.5:1 contrast. Native light/dark themes are immutable data selected by `ThemeProvider`; system mode follows `useColorScheme`. These are deterministic renderer conversions, not a second authored token source.

## Build graph

```text
packages/design ──drift check──▶ generated web/core artifacts
                                      │
@vllnt/ui ────────────────────────────┤──▶ registry app
                                      │
@vllnt/ui-core ──▶ @vllnt/ui-native ─┴──▶ Expo native catalog
```

Turborepo orders package builds through workspace dependencies. The native CI job additionally runs lint, strict type checks, unit/contract tests, renderer boundary checks, packed-artifact resolution, Expo Doctor, and Android/iOS Metro exports.

| Workflow | Responsibility |
|----------|----------------|
| `ci.yml` | Existing workspace gates plus an isolated native package/Expo job |
| `publish.yml` | Existing `@vllnt/ui` canary and stable releases |
| `native-canary.yml` | Synchronized core/native canaries after native quality gates |
| `storybook.yml` | Existing web Storybook build and deployment |

## Platform-aware registry

`apps/registry/registry.json` remains the canonical shadcn-compatible index. Generation adds a required `platforms` array to every item. Native-capable entries also carry:

```json
{
  "platforms": ["web", "native"],
  "native": {
    "package": "@vllnt/ui-native",
    "channel": "canary",
    "status": "experimental",
    "parity": "full"
  }
}
```

`shadcn build` strips extension fields, so `stamp-registry-metadata.ts` restores them in generated public descriptors. The website exposes platform badges and filtering; `/llms.txt`, `/llms-full.txt`, JSON routes, search, JSON-LD, and MCP return the same availability contract.

Web installation remains shadcn-based. Native installation is package-based during the pilot. Registry metadata is discovery information, not a claim that the web shim runs on React Native.

## Release boundaries

The existing `publish.yml` remains exclusively responsible for `@vllnt/ui`, including stable releases. `native-canary.yml` has no manual dispatch and cannot publish `latest`, create Git tags, or create GitHub releases. It publishes synchronized core/native canary versions in dependency order and verifies that neither `latest` tag moves.
