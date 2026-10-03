# Penpot migration status — 2026-10-03

The full design has been imported, but migration acceptance is still open.
Keep the original `design/vllnt-ui.pen`, legacy content and all previous recovery
points. A successful import or checksum is not proof that every component looks
and behaves correctly.

## Destination and authority

- Team: `vllnt` (`922b72d2-2185-8146-8008-b95add9df3c4`).
- Canonical project: `503b8235-8be1-80bf-8008-ba5ff4e2d3b6`.
- Starter consumer: `503b8235-8be1-80bf-8008-ba83182b5131`.
- The 39 canonical file IDs/names are in [complete.json](snapshots/2026-10-03/complete.json), alongside the Starter.
- Files prefixed `[Validation]` or `[Recovery]` are trials or restore copies.
  They must not be mistaken for canonical libraries.

## Verified evidence

- The historical complete archive contains 39 canonical modules plus Starter:
  **210 source boards, 245,024 shapes, 1,854 component definitions, 159 library
  relationships**. Source coverage checks found no missing boards, shapes,
  components or token bindings. The strict 39-file checker flags the additional
  Starter; the known 40-file scope was separately qualified and the original
  finding is retained in [verification.json](snapshots/2026-10-03/verification.json).
- The newer partial export covers **15 modules, 129 source boards, 55,001 shapes,
  873 component definitions and 45 relationships**. Within that scope, no source
  objects/components/token bindings are missing. It is not a fresh full backup.
- The live catalog check found **29 canonical shared libraries and 1,844 visible
  entries**. Atoms 02 groups 13 states into 3 variant families, explaining the
  difference from 1,854 saved definitions. No canonical library is missing.
- Six connected libraries expose seven token sets, 1,439 token entries and four
  themes. This proves availability; it does not prove propagation or appearance
  in every consumer. Older saved archives contain earlier token states.
- Saved effect conservation matched 8,205 shapes, 9,236 shadows and 892 background
  blurs. Media metadata and both JPEG payload hashes matched the source cache.
  These checks do not establish every crop or visual rendering.
- Native MCP access worked during the audit. Its focused document was a private
  glyph validation trial at revision 16, with zero native validation errors.
  This says nothing about native validation of all 39 canonical files.

## Remaining work, in dependency order

1. **Baseline and recovery:** obtain a fresh full export of all canonical files
   and current consumers; validate each file, reimport into a separate recovery
   project, save/reopen, and compare dependency links. The latest combined
   partial archive still needs this native restore test.
2. **Engine qualification:** qualify the consolidated Penpot fixes in the
   optimized Linux build before deployment. Isolated lab checks passed, but
   deployment, rollback and the complete optimized-bundle test matrix are not
   proven. Ordinary MCP work does not require a new Docker deployment.
3. **Tokens and themes:** prove safe updates and all four theme contexts through
   representative consumers, then cover every component family. Keep the
   tokens → atoms → molecules → organisms → templates → pages dependency order.
4. **Fonts:** historical evidence minus accepted canonical fixes leaves **1,311
   regular aliases, six italic aliases and one unavailable IBM Plex Mono 800
   style**. The newer partial archive directly contains 1,263 regular aliases,
   six italic aliases and that unavailable style; the other 48 are based on
   older saved evidence. Re-audit before editing. Private trials are not fixes
   to canonical files.
5. **Atoms and glyphs:** complete 182 glyph uses across nine modules, including
   106 hidden uses. The 31-item private trial remains unreceived: its saved
   geometry/order checks passed, but 148 reflected descendants remain. Preserve
   it as a trial until rendering, replacement and consumer behavior pass.
6. **Paint fidelity:** resolve six angular-gradient cases (two fill, four
   border). Review the queues of 675 cap/join, 271 per-side stroke, 96 arc and 79
   gradient records; these are review candidates, not proven corrupt counts.
7. **Variants and molecules:** extend native variant/override/swap/update proof
   beyond the three Selection families. Molecules 07 has a historical 3,773
   outside-subtree difference set. Its private update trial lost 596 sizing
   attributes; a workaround protects 536 and leaves 60 open. The engine
   candidate passed 596/596 in isolation, not in canonical acceptance.
8. **Organisms and templates:** finish mixed-font/layout review. Molecules 01
   has 58 source dimensions changed by up to 9 px in the lab; Organisms 01 has
   a small geometry reservation; Templates 01's protected paragraph difference
   remains unreceived. Then verify page composition and source propagation.
9. **Final acceptance:** visual review, complete shared-library consumer proof,
   native full recovery/reopen, and a final off-server snapshot. Only then
   update repository authority from Pen to Penpot and retire individual legacy
   replacements whose consumers are proven. No bulk deletion.

The older design-system ledger (315 modules: 122 partial, 193 pending) measures
broader design acceptance, not 315 missing imports. Keyboard, touch, voice,
dynamic states, reduced motion and actual AR-runtime checks remain separate
implementation evidence; a Penpot canvas does not prove them.

## Snapshot policy

Use [the recovery workflow](README.md) after each accepted design batch. Keep
native named versions for quick rollback and native exports outside the server
for disaster recovery. The initial release preserves the historical full and
newer partial archives without claiming an automatic merge or continuous sync.
No scheduled automation has been restarted.
