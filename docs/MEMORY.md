# Memory

## Decisions

- 2026-06-10 · Kept the three `formatPrice` variants local (watchlist, ticker-tape, model-selector) instead of extracting a shared formatter · they differ semantically (2-decimal locale string vs plain locale string vs `$X.XX/1M` with N/A) — unifying them would force a config-flag interface shallower than three honest one-liners.
- 2026-06-10 · `packages/ui/scripts/generate-docs.ts` keeps a local `RegistryItem` type instead of importing `apps/registry/types/registry.ts` · cross-package relative import from a library script into an app is a worse coupling than one duplicated narrow type; revisit only if a shared `@vllnt/registry-types` package appears.
- 2026-06-10 · `getInitials` left duplicated (activity-log, historical-figure-card) · two occurrences — below the Rule of Three; extract on the third.
- 2026-06-10 · `useEscapeKey`/`useDocumentKeyDown` always listen on `document`, never `window` · keydown bubbles through both, so the old window listeners were behaviorally identical; one target keeps the interface smaller. Tests must dispatch via `document.body` (events dispatched directly on `window` never reach document listeners).
