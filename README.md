# @vllnt/ui

React component library built on Radix UI primitives + Tailwind CSS. Published as `@vllnt/ui` on GitHub Packages.

## Monorepo Structure

| Package | Path | Description |
|---------|------|-------------|
| `@vllnt/ui` | `packages/ui` | Component library (published) |
| `@vllnt/eslint` | `packages/eslint-config` | Shared ESLint flat config |
| `@vllnt/typescript` | `packages/tsconfig` | Shared TypeScript configs |
| `@vllnt/ui-registry` | `apps/registry` | Component registry + docs (Next.js) |

## Quick Start

```bash
git clone https://github.com/bntvllnt/ui.git
cd ui
pnpm install
pnpm build
```

## Scripts

All scripts run via [Turborepo](https://turbo.build/repo) from the root:

| Script | Description |
|--------|-------------|
| `pnpm dev` | Start dev servers |
| `pnpm build` | Build all packages |
| `pnpm lint` | Lint all packages |
| `pnpm lint:fix` | Lint + auto-fix |
| `pnpm test` | Run tests (watch) |
| `pnpm test:once` | Run tests (single run) |
| `pnpm clean` | Clean build artifacts |
| `pnpm check:circular` | Detect circular imports |

## Consumer Setup

See [`packages/ui/README.md`](packages/ui/README.md) for installation, Tailwind preset, and usage instructions.

## Publishing

Publishing is automated via GitHub Actions (`.github/workflows/publish.yml`):

1. Bump version in `packages/ui/package.json`
2. Push a `v*` tag (e.g., `git tag v0.2.0 && git push --tags`)
3. CI builds, verifies output, and publishes to GitHub Packages with provenance

## License

[MIT](LICENSE)
