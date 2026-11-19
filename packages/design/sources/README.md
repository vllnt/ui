# Design sources

Read-only reference copies of design exports. The token generator never reads
this directory: `../tokens.json` is the only source of truth, and the files
here exist so reviewers can check a theme's values against where they came from.

| File | Provenance |
|------|------------|
| `maia-tokens.penpot.json` | Penpot file `24943321-cd66-804d-8008-e8f386f7e602`, exported 8 Nov 2026 by the maia manager. Multi-set DTCG: sets `Maia/core`, `Maia/dark`, `Maia/light`, plus `$themes` and `$metadata.tokenSetOrder`. |

`themes.maia` in `../tokens.json` carries these values as OKLCH channels. They
round-trip to the exported hex values exactly; `../scripts/product-themes.test.mjs`
checks that against this copy. The same file runs the generator in a scratch
copy of the repository with this directory changed, corrupted or removed, and
asserts the generated outputs stay byte for byte the same.

To refresh a copy, replace the file byte for byte, update the provenance row,
and re-check the theme values in `../tokens.json`.
