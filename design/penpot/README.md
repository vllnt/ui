# Penpot design snapshots

Git tracks the exact SHA-256 checksums, file inventories, revisions, library
links and qualification notes of native, editable Penpot exports. Versioned
GitHub release assets are the proposed off-server storage, keeping hundreds of
megabytes out of every clone. No Git LFS or Python packages
are required. The checker requires Python 3.9 or newer.

**Publication pending:** the two native archives remain local; no archive has
been uploaded to GitHub. Explicit approval to upload their editable contents
is pending. The release URL in the receipts is a reserved destination, and the
download commands below become usable only after publication. See the
[publication record](snapshots/2026-10-03/publication.json) and
[migration status and remaining work](STATUS.md).

## Current recovery points

| Receipt | Native export | Coverage | Qualification |
| --- | --- | --- | --- |
| [complete.json](snapshots/2026-10-03/complete.json) | 2026-10-02; 300,739,780 bytes | 39 canonical modules + Starter; 1,854 component definitions | Historical complete backup. Native recovery/reopen was previously checked; later corrections are absent. |
| [partial.json](snapshots/2026-10-03/partial.json) | 2026-10-03; 68,988,603 bytes | 15 modules; 873 component definitions | Newer saved state for the listed files only. Combined archive has not undergone a native reimport/reopen test. |

These are two separate recovery points, not an automatically merged latest
backup. Importing the partial archive on top of the full one is **not** a proven
update procedure: native imports can create new IDs and library relationships.
Use separate recovery projects and check the complete dependency graph before
promoting any recovered copy.

The per-file `filePayloadSha256` is computed over sorted file-owned ZIP member
paths and their byte hashes. It stays stable across ZIP repacking/compression,
but changes when saved file content or metadata changes. The archive hash also
protects shared media and thumbnails. Counts exclude the synthetic page roots.
An inventory describes saved data; it is not a visual or runtime acceptance test.

## Download and verify

From the repository root (GitHub CLI required only for the download):

```sh
mkdir -p design/penpot/downloads/2026-10-03
gh release download penpot-snapshot-2026-10-03 --repo vllnt/ui \
  --pattern '*.penpot' --dir design/penpot/downloads/2026-10-03
python3 scripts/penpot_snapshot.py verify \
  design/penpot/snapshots/2026-10-03/complete.json \
  design/penpot/snapshots/2026-10-03/partial.json \
  --asset-dir design/penpot/downloads/2026-10-03
```

The checker reads every ZIP member to check CRC integrity and compares the
archive size, SHA-256, and full inventory with the committed receipt. It does not
extract archives, contact Penpot, or modify any design. A missing, corrupt or
mismatched archive fails with a nonzero exit code.

## Recover safely in Penpot

1. Verify the downloaded archive with the command above.
2. Create a separate recovery project in the `vllnt` team, then use Penpot's
   dashboard file import for the native `.penpot` export.
3. Compare the imported file names/counts, library links and component catalog
   with the receipt. Imports may assign different IDs. Open every imported file,
   run native validation, and save/reopen it. Check media, fonts and layout.
4. Test a component from the recovered shared libraries in a separate consumer
   file, including a source update and an instance override.
5. Promote only after those checks. Keep the original Pen source, current
   canonical files and previous snapshots until recovery and consumers pass.

This is a file-level recovery mechanism, not a backup of the entire self-hosted
server. Accounts, permissions, history, comments, database and service
configuration require the server's own backup system.

## Save the next design batch

1. Confirm the exact file ID and that its content is saved. In Penpot, create a
   named version before a risky edit. The public plugin API also supports
   `await penpot.currentFile.saveVersion("Before <batch>")`; always verify the
   expected file ID first. Versions are local to the server and do not replace
   off-server exports.
2. Export native `.penpot` files with their linked libraries. Prefer a complete
   canonical-project export plus the Starter. Clearly label any smaller export
   as partial. Never assume the currently focused trial covers all 39 modules.
3. Use a new tag and receipt path, without replacing an earlier release asset:

```sh
python3 scripts/penpot_snapshot.py record /path/to/export.penpot \
  --output design/penpot/snapshots/<date>/<scope>.json \
  --exported-on <actual-export-date> \
  --scope 'PARTIAL: list the included modules and exclusions' \
  --release-tag penpot-snapshot-<date>-<batch> \
  --note 'Saved archive; native reopen/visual/consumer checks: state actual results'
```

4. Review the inventory and its Git diff. Scope and export date are operator
   declarations; the tool cannot establish that an export is current or complete.
5. Commit the receipt and qualification notes, then attach the native export to
   a versioned GitHub release targeting that commit. Keep design snapshots out
   of the software “Latest” release (`gh release create ... --latest=false`).
   The repository is public: publish only reviewed design assets, never auth
   state, environment files, server backups or raw browser diagnostics.
6. Download the uploaded assets into a fresh directory and run `verify` against
   the committed receipts. Record native reimport/reopen separately. Never
   describe hash verification alone as a successful native restore.

No scheduled exports are configured. Future saves require a native export and
a new receipt/release; the Git records do not continuously mirror live Penpot.

## Check the tracking tool

```sh
python3 -m unittest discover -s scripts -p 'test_penpot_snapshot.py' -v
```
