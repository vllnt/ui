# VLLNT UI Design Tokens

`tokens.json` is the machine-readable companion to the root `DESIGN.md` guide.
It mirrors the public CSS variables in `packages/ui/themes/default.css` and adds
the typography, spacing, radius, elevation, motion, and iconography rules agents
need for consistent generated UI.

## Schema

The token file follows `tokens.schema.json`:

- `name`: fixed library name, `VLLNT UI`.
- `version`: target library version for the token contract.
- `source`: pointers back to the human guide and CSS theme implementation.
- `color.semantic`: CSS variable names, light/dark HSL channels, and intended roles.
- `typography.scale`: font size, line height, and weight for canonical text styles.
- `spacing.scale`: 4-point spacing tokens mapped to rem values.
- `radius`: allowed radius tokens.
- `elevation`: allowed shadow tokens.
- `motion`: allowed durations, easing, and reduced-motion behavior.
- `iconography`: icon library, sizes, stroke, and color policy.

The public registry mirrors this file at `/r/design.json`.
