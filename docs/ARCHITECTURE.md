# Architecture

## Monorepo layout

```
vllnt/ui/
├── packages/
│   └── ui/                   # @vllnt/ui — the shipped library
│       ├── src/
│       │   ├── components/   # 144 component folders
│       │   ├── hooks/        # shared hooks (useDebounce, etc.)
│       │   ├── lib/          # utilities (cn, registry helpers)
│       │   └── index.ts      # barrel — the public surface
│       ├── dist/             # tsup output (published)
│       ├── styles.css
│       └── themes/
├── apps/
│   └── registry/             # Next.js site at ui.vllnt.ai
│       ├── app/              # app-router routes (components/[slug], etc.)
│       ├── content/          # MDX pages
│       ├── lib/              # registry + OG utilities
│       └── registry.ts       # shadcn-compatible registry feed
├── .github/workflows/        # ci.yml, publish.yml, storybook.yml
├── specs/                    # feature specs (active + shipped)
└── docs/                     # contributor docs (this folder)
```

## Package boundaries

| Package | Purpose | Published |
|---------|---------|-----------|
| `@vllnt/ui` | Component library | Yes, public npm |
| `@vllnt/ui-registry` (registry app) | Docs + shadcn registry | No, deployed to `ui.vllnt.ai` |

External shared configs consumed as dev deps from npm:

- `@vllnt/eslint-config` — ESLint 9 flat config
- `@vllnt/typescript` — shared `tsconfig` bases

## Tech stack

- **Runtime:** React 19, Radix UI primitives, Tailwind CSS 3, CVA, tailwind-merge.
- **Build:** `tsup` (library), Next.js (registry app).
- **Test:** Vitest (unit, `jsdom`), Playwright CT (visual, real Chromium), Storybook (interactive + test-runner smoke).
- **Lint:** ESLint 9 flat config. TypeScript strict.
- **Workspace:** pnpm workspaces + Turborepo.

## Component module layout

Every component is a self-contained folder:

```
src/components/{name}/
  {name}.tsx         # implementation — forwardRef + cn + CVA + Radix (if applicable)
  {name}.test.tsx    # Vitest unit tests
  {name}.visual.tsx  # Playwright CT story (real browser)
  {name}.mdx         # registry / docs content
  index.ts           # barrel export from the folder
```

The root `src/index.ts` re-exports components for consumers.

## Build graph

```
@vllnt/ui  build  ─▶  dist/       (tsup, preserves "use client")
                   └▶ styles.css  (copied)
                   └▶ themes/     (copied)

registry app build ─▶ .next/      (consumes @vllnt/ui via workspace link in dev,
                                    via tsup dist in production CI)
```

`pnpm check:circular` runs `madge` to catch circular imports under `packages/ui/src`.

## Theming

All color/spacing/radius values are HSL CSS variables on `:root` and `.dark` in `styles.css`. Downstream apps override variables without patching components. The Tailwind preset (`@vllnt/ui/tailwind-preset`) maps variables to Tailwind tokens so utility classes stay in sync with theme overrides.

## CI pipelines

| Workflow | Triggers | Jobs |
|----------|----------|------|
| `ci.yml` | push to `main`, PRs | install → lint → typecheck → test → build |
| `publish.yml` | push to `main`, manual dispatch | quality gates → canary (push) OR release (dispatch) |
| `storybook.yml` | push to `main`, PRs | build Storybook + optional deploy |

`publish.yml` uses `npx --yes npm@latest publish` so OIDC trusted publishing survives runner-bundled npm (which is older than 11.5.1).

## Registry feed

The shadcn-compatible registry at `https://ui.vllnt.ai/r/{component}.json` is generated from `apps/registry/registry.ts` and served by the Next.js app. Each component resolves to a JSON payload consumable by `shadcn add`.
