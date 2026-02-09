# @vllnt/typescript

Shared TypeScript configurations. Strict mode enforced.

## Config Files

| File | Usage |
|------|-------|
| `base.json` | Base config — extended by all others |
| `nextjs.json` | Next.js apps |
| `nodejs.json` | Node.js packages |
| `node-library.json` | Published Node libraries |
| `react.json` | React libraries |

## Usage

```jsonc
// tsconfig.json (Next.js app example)
{
  "extends": "@vllnt/typescript/nextjs.json",
  "compilerOptions": {
    "paths": { "@/*": ["./src/*"] }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx"],
  "exclude": ["node_modules"]
}
```

## Conventions

- All configs extend `base.json`
- Strict mode enabled across all configs
