# @vllnt/ui-core

Platform-neutral design tokens and portable component contracts shared by the VLLNT UI web and React Native renderers.

## Install

```bash
pnpm add @vllnt/ui-core
```

- `latest` is the stable release, published from a `ui-core-vX.Y.Z` tag by `native-release.yml` with npm provenance.
- `canary` is published with `@vllnt/ui-native` from every core or native change on `main`, as `<next>-canary.<run>.sha<commit>`.

React Native apps install it with `@vllnt/ui-native`, which pins the exact core version it was built with. See [releasing](../../docs/RELEASING.md).

## Use

```ts
import {
  createNativeTheme,
  designTokens,
  type ButtonVariant,
} from "@vllnt/ui-core";

const theme = createNativeTheme("dark", {
  colors: { primary: "#f5f5f5" },
});
```

Exports include the authored token object, generated React Native-compatible themes, and renderer-neutral option unions for the pilot components. The JSON contracts are also available from `@vllnt/ui-core/tokens.json` and `@vllnt/ui-core/contracts.json`.

`packages/design/tokens.json` and `packages/design/component-contracts.json` are the authored sources. Run `pnpm -F @vllnt/design-source tokens:generate` after changing either file. Generated artifacts are committed and checked for drift in CI.
