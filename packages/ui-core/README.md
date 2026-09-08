# @vllnt/ui-core

Platform-neutral design tokens and portable component contracts shared by the VLLNT UI web and React Native renderers.

> Experimental and source-only. The first synchronized `canary` publication with `@vllnt/ui-native` is planned but is not available yet.

The package base is **0.4.0**. Core and Native will use the same `0.4.0-canary.<run>.sha<commit>` prerelease; this version bump does not establish npm availability. Stable promotion requires a separate reviewed change after verification; see [releasing](../../docs/RELEASING.md).

## Planned install

After the first canary publication:

```bash
pnpm add @vllnt/ui-core@canary
```

Until then, use this package only from the repository workspace.

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
