# VLLNT UI Design Tokens

`tokens.json` is the machine-readable companion to the root `DESIGN.md` guide.
It is the authored source for the public web CSS variables and the generated
React Native theme in `@vllnt/ui-core`. `component-contracts.json` defines the
portable option names shared by the web and native pilot components.

After editing either source, regenerate committed artifacts from the repository
root:

```bash
pnpm -F @vllnt/design-source tokens:generate
pnpm -F @vllnt/design-source tokens:check
```

The generator preserves the existing `@vllnt/ui` CSS entry points and converts
OKLCH colors to sRGB for React Native, where OKLCH is not reliably supported.

## Schema

The token file follows `tokens.schema.json`:

- `name`: fixed library name, `VLLNT UI`.
- `version`: target library version for the token contract.
- `source`: pointers back to the human guide and CSS theme implementation.
- `color.semantic`: CSS variable names, light/dark OKLCH channels, and intended roles.
- `typography.scale`: font size plus explicit font-size and line-height CSS variables.
- `spacing.scale`: 4-point spacing tokens mapped to rem values.
- `radius`: allowed radius tokens.
- `elevation`: allowed shadow tokens.
- `motion`: allowed durations, easing, and reduced-motion behavior.
- `iconography`: icon library, sizes, stroke, and color policy.

The public registry mirrors this file at `/r/design.json`.
