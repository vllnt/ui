# Visual regression testing

The canonical screenshots live in `packages/ui/.snapshots/linux/`. Generate and compare them on **Linux ARM64** in `mcr.microsoft.com/playwright:v1.58.2-noble`, matching the Playwright version in the lockfile and the CI container. The visual job uses `ubuntu-24.04-arm`; other jobs retain x86 runners. CI pins the image manifest digest `sha256:6446946a1d9fd62d9ae501312a2d76a43ee688542b21622056a372959b65d63d`. The suite fixes locale to `en-US`, timezone to `UTC`, and reduced motion to make layout comparisons reproducible. Animation behavior remains covered by component unit tests.

Do not compare macOS or Linux x86 screenshots with the Linux ARM64 baseline set. Even a shared container manifest can resolve to architecture-specific images with different font rendering. The snapshot path includes the operating system; use `--platform linux/arm64` when starting the container to also match the canonical architecture.

## Compare

From a clean checkout, run in the pinned Linux container:

```sh
corepack enable
corepack prepare pnpm@9.15.4 --activate
pnpm install --frozen-lockfile
pnpm -F @vllnt/ui test:visual --workers=2 --update-snapshots=none
```

Mount or copy only the checkout into the container; install Linux dependencies there instead of sharing host `node_modules`. CI runs the same comparison and uploads test results on failure. Missing snapshots fail the job rather than being accepted.

## Refresh deliberately

In the same container, select only the affected fixtures:

```sh
pnpm -F @vllnt/ui test:visual sidebar --workers=1 --update-snapshots
pnpm -F @vllnt/ui test:visual sidebar --workers=1 --update-snapshots=none
```

Inspect expected/actual/diff images and commit only intentional changes together with their source changes. Never update snapshots in CI to make a failing comparison pass. When upgrading Playwright, upgrade the container version and review regenerated screenshots together.

The initial Linux baseline set was generated from `main` at `38db630`, not from the Native feature branch. Snapshot equality proves the states exercised by the existing visual fixtures; it does not replace keyboard, accessibility, reduced-motion behavior, or physical-device tests.
