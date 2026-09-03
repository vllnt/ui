# @vllnt/ui-core

Platform-neutral design tokens and portable component contracts shared by the VLLNT UI web and React Native renderers.

> Experimental. This package is published only on the `canary` npm tag while the native renderer is validated.

## Install

```bash
pnpm add @vllnt/ui-core@canary
```

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
