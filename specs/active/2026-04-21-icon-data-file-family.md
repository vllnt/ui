# Icon data + file family

## Goal
Define and stage a **data + file icon family** for `@vllnt/ui` so documents, files, media, models, streams, datasets, and storage objects share a consistent visual language across tables, cards, inspectors, and future canvas nodes.

## Related issue
- #126 feat(icon-family): Data + file icons — files, documents, models, storage

## Constraints
- Repo: `/home/ubuntu/ui`
- Worktree: `/home/ubuntu/ui/.worktrees/icon-data-file-family`
- Branch: `feat/icon-data-file-family`
- Base: `feat/storybook`
- Follow repo-local `CLAUDE.md`
- Keep this PR scoped to **spec + rollout plan**, not full implementation
- No new dependencies in this planning pass

## Problem statement
The design system has no cohesive icon language for file types and data objects. That creates friction in document-heavy interfaces, analytics surfaces, and any move toward spatial object-based UI.

## Proposed scope
- file types: folder, file, pdf, sheet, doc, image, audio, video, code, archive
- data objects: dataset, database, table, stream, queue, model, embedding, vector index
- storage + pipeline: bucket, upload, download, sync, transform, publish
- states: locked, versioned, stale, processing, ready, failed

## Acceptance criteria
- AC-1: define categories and naming rules for file + data icons
- AC-2: define pairings for object type + state overlays where needed
- AC-3: define package export shape and usage rules for lists/cards/inspectors/canvas nodes
- AC-4: define Storybook + registry coverage expectations
- AC-5: keep object semantics stronger than raw file-extension decoration

## Likely implementation files later
- `packages/ui/src/icons/data/*`
- `packages/ui/src/icons/files/*`
- `packages/ui/src/icons/index.ts`
- registry examples for file list, asset browser, object card, inspector row, node card

## Validation for this PR
- docs-only review
- `git diff --check`

## Rollout notes
- Prefer semantic object icons first, extension-specific logos second
- Support overlay states instead of duplicating every icon variant
- Prioritize the set needed by registry, dashboards, and canvas inspectors
