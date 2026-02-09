# @vllnt/eslint

Shared ESLint configuration — flat config format (ESLint 9.x).

## Exports

| Export | File | Usage |
|--------|------|-------|
| `.` | `flat/index.js` | Base config (all packages) |
| `./nextjs` | `flat/nextjs.js` | Next.js apps |
| `./nodejs` | `flat/nodejs.js` | Node.js packages |
| `./convex` | `flat/convex.js` | Convex functions |
| `./react` | `flat/react.js` | React libraries |

## Usage

```javascript
// eslint.config.js (Next.js app example)
import baseConfig from "@vllnt/eslint"
import nextjsConfig from "@vllnt/eslint/nextjs"

export default [...baseConfig, ...nextjsConfig]
```

## Key Plugins

- `typescript-eslint` — TypeScript rules
- `@next/eslint-plugin-next` — Next.js rules
- `@convex-dev/eslint-plugin` — Convex rules
- `eslint-plugin-boundaries` — module boundary enforcement
- `eslint-plugin-perfectionist` — sorting/ordering
- `eslint-plugin-unicorn` — best practices
- `eslint-plugin-jsx-a11y` — accessibility

### Adding a New Rule

1. Determine which config it belongs to (base, nextjs, nodejs, convex, react)
2. Edit `flat/<config>.js`
3. Test: `pnpm -F @vllnt/eslint lint` (self-lint), then test in a consumer app
4. Rules affecting all packages go in `flat/index.js`

## Conventions

- Flat config format only (no `.eslintrc`)
- Prettier integration via `eslint-config-prettier` + `eslint-plugin-prettier`
- No `eslint-disable` comments in consuming packages
