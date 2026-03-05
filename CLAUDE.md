# @vllnt/ui Monorepo

React component library monorepo. Radix UI primitives + Tailwind CSS + CVA variants.

## Package Map

| Package | Path | Published |
|---------|------|-----------|
| `@vllnt/ui` | `packages/ui` | GitHub Packages |
| `@vllnt/ui-registry` | `apps/registry` | deployed (Next.js) |

## Shared Configs (npm)

| Package | Usage |
|---------|-------|
| `@vllnt/eslint-config` | ESLint flat config (npm `^1.0.0`) |
| `@vllnt/typescript` | TypeScript configs (npm `^1.0.0`) |

## Tech Stack

- React 19, Radix UI primitives, Tailwind CSS 3, CVA, tailwind-merge
- Build: tsup (library), Next.js (registry app)
- Test: Vitest (unit), Playwright CT (visual/component)
- Lint: ESLint 9 flat config
- TypeScript strict mode
- Monorepo: pnpm workspaces + Turborepo

## Package Manager

pnpm (lockfile: `pnpm-lock.yaml`)

## Commands

All from root via `turbo`:

| Command | Scope |
|---------|-------|
| `pnpm build` | All packages |
| `pnpm lint` | All packages |
| `pnpm lint:fix` | All packages |
| `pnpm test` | All packages (watch) |
| `pnpm test:once` | All packages (single run) |
| `pnpm clean` | All packages |
| `pnpm check:circular` | Circular import detection |

Package-scoped (from `packages/ui`):

| Command | What |
|---------|------|
| `pnpm test:coverage` | Vitest with coverage |
| `pnpm test:visual` | Playwright CT snapshots |
| `pnpm test:visual:update` | Update visual snapshots |
| `pnpm test:generate` | Generate test stubs |

## Component Conventions

File structure per component:

```
src/components/{name}/
  {name}.tsx           # Implementation
  {name}.test.tsx      # Vitest unit test
  {name}.visual.tsx    # Playwright CT story
  index.ts             # Barrel export
```

- One component per directory under `src/components/`
- Barrel exports in `src/index.ts`
- shadcn-style patterns (forwardRef, cn(), Slot support)

## Coding Patterns

- `cn()` from `src/lib/utils.ts` — merges clsx + tailwind-merge
- CVA for variant definitions (`class-variance-authority`)
- Radix primitives for accessible behavior (dialog, dropdown, etc.)
- `React.forwardRef` + `React.ComponentPropsWithoutRef` on all components
- CSS variables for theming (`--primary`, `--background`, etc.) in `styles.css`

## Testing

- **Unit**: Vitest + Testing Library (`*.test.tsx`)
- **Visual**: Playwright CT (`*.visual.tsx`) — component-level snapshot tests
- Run unit: `pnpm test:once` (root) or `pnpm -F @vllnt/ui test:once`
- Run visual: `pnpm -F @vllnt/ui test:visual`

## Publishing

- GitHub Packages registry (`npm.pkg.github.com`)
- Tag-triggered CI: push `v*` tag -> `.github/workflows/publish.yml`
- Provenance attestation enabled

## Conventions

- ESLint flat config only (no `.eslintrc`)
- TypeScript strict mode via `@vllnt/typescript`
- No `eslint-disable` comments
- No `any`, `as` assertions, or `@ts-ignore`
