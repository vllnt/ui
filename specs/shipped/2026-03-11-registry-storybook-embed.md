# Thin Registry + Storybook Embeds

**Tier**: standard | **Est**: 2-4h | **Branch**: feat/storybook

## Problem

Registry app duplicates component showcasing: 1,714 LOC ComponentPreview switch, 34 MDX files, hardcoded previews — all redundant now that Storybook stories exist.

## Solution

Stories = SSoT. Registry embeds Storybook iframes for previews, pulls metadata from stories at build time. Delete all duplicate content.

## Scope

- [x] 1. Create `StorybookEmbed` client component (iframe wrapper with loading state)
- [ ] 2. Create `scripts/sync-from-storybook.ts` — reads index.json, enriches registry data
- [ ] 3. Add `parameters.category` + `parameters.docs.description` to all stories
- [ ] 4. Replace `ComponentPreview` usage in [slug]/page.tsx with StorybookEmbed
- [ ] 5. Remove MDX reading logic from [slug]/page.tsx, use synced descriptions
- [ ] 6. Remove example.mdx "Usage" section — link to Storybook instead
- [ ] 7. Delete `components/component-preview/` directory (1,714 LOC)
- [ ] 8. Delete all header.mdx + example.mdx files (34 files)
- [ ] 9. Update registry build pipeline: storybook build → sync → next build
- [ ] 10. Quality pass: lint + typecheck + build + test

## Architecture

```
BUILD PIPELINE:
  pnpm build-storybook          → storybook-static/index.json
       ↓
  scripts/sync-from-storybook   → component-metadata.json (title, desc, category, storyId)
       ↓
  pnpm -F registry build        → reads component-metadata.json + registry.json
       ↓
  /components/[slug]            → <StorybookEmbed storyId="..." /> (iframe)
```

```
COMPONENT PAGE (after):
┌──────────────────────────────────┐
│ Title + description              │ ← from component-metadata.json (synced from stories)
│ <QuickAdd />                     │ ← unchanged
│ ┌──────────────────────────────┐ │
│ │ <iframe>                     │ │ ← StorybookEmbed (configurable URL)
│ │  Storybook story preview     │ │    dev: localhost:6006
│ │  with controls               │ │    prod: STORYBOOK_URL env var
│ └──────────────────────────────┘ │
│ Installation command             │ ← unchanged
│ "View in Storybook →" link       │ ← replaces Usage/example.mdx section
│ Source code                      │ ← unchanged
│ Dependencies                     │ ← unchanged
└──────────────────────────────────┘
```

## Acceptance Criteria

- GIVEN stories have category+description, WHEN sync runs, THEN registry pages show correct metadata
- GIVEN StorybookEmbed on page, WHEN user loads /components/button, THEN iframe shows interactive button story
- GIVEN no MDX files, WHEN registry builds, THEN build succeeds with no errors
- GIVEN shadcn CLI, WHEN `shadcn add` runs, THEN /r/*.json still works (unchanged)

## State Machine

N/A — Stateless build pipeline transformation.

## Progress

| Item | Status | Iteration |
|------|--------|-----------|
| StorybookEmbed component | [x] Complete | 1 |
| sync-from-storybook script | [ ] Pending | - |
| Story metadata enrichment | [ ] Pending | - |
| Page.tsx refactor | [ ] Pending | - |
| Delete ComponentPreview | [ ] Pending | - |
| Delete MDX files | [ ] Pending | - |
| Build pipeline update | [ ] Pending | - |
| Quality pass | [ ] Pending | - |
