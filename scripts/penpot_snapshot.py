#!/usr/bin/env python3
"""Record or verify native Penpot exports without editing or extracting them.

Uses only the Python 3 standard library. Scope and export date are declarations;
checksums and inventories are computed from the supplied saved archive.
"""

import argparse
import hashlib
import json
from pathlib import Path
import sys
import zipfile


ROOT_SHAPE = "00000000-0000-0000-0000-000000000000.json"


def sha256_file(path):
    digest = hashlib.sha256()
    with path.open("rb") as stream:
        for block in iter(lambda: stream.read(1024 * 1024), b""):
            digest.update(block)
    return digest.hexdigest()


def inventory(path):
    """Read every member (including CRC), then summarize each exported file."""
    with zipfile.ZipFile(path) as archive:
        names = archive.namelist()
        if len(names) != len(set(names)):
            raise ValueError("duplicate ZIP member names")
        manifest = json.loads(archive.read("manifest.json"))
        if manifest.get("type") != "penpot/export-files" or manifest.get("version") != 1:
            raise ValueError("unsupported native Penpot export manifest")
        file_ids = [item["id"] for item in manifest["files"]]
        if len(file_ids) != len(set(file_ids)) or not file_ids:
            raise ValueError("empty or duplicate file IDs")
        members = {fid: [] for fid in file_ids}
        # Reading every member also validates its CRC. No extraction or writes.
        for name in sorted(names):
            payload = archive.read(name)
            parts = name.split("/")
            if parts[0] != "files" or len(parts) < 2 or name.endswith("/"):
                continue
            fid = parts[1].removesuffix(".json")
            if fid not in members:
                raise ValueError("file payload absent from export manifest: " + fid)
            members[fid].append((name, hashlib.sha256(payload).hexdigest()))
        rows = []
        for item in sorted(manifest["files"], key=lambda item: item["id"]):
            fid = item["id"]
            data = json.loads(archive.read("files/" + fid + ".json"))
            if data["id"] != fid or data["name"] != item["name"]:
                raise ValueError("file metadata disagrees with export manifest: " + fid)
            owned = [name.split("/") for name, _ in members[fid]]
            fingerprint = hashlib.sha256(json.dumps(
                members[fid], separators=(",", ":"), ensure_ascii=False
            ).encode()).hexdigest()
            rows.append({
                "id": fid,
                "name": data["name"],
                "revision": data.get("revn"),
                "modifiedAt": data.get("modifiedAt"),
                "sharedLibrary": data.get("isShared", False),
                "pages": sum(len(s) == 4 and s[2] == "pages" and s[-1].endswith(".json") for s in owned),
                "shapes": sum(len(s) == 5 and s[2] == "pages" and s[-1].endswith(".json") and s[-1] != ROOT_SHAPE for s in owned),
                "components": sum(len(s) == 4 and s[2] == "components" and s[-1].endswith(".json") for s in owned),
                "filePayloadSha256": fingerprint,
            })
        relations = sorted(manifest.get("relations", []))
        for relation in relations:
            if len(relation) != 2 or any(fid not in members for fid in relation):
                raise ValueError("library relation points outside this export")
        return {
            "generatedBy": manifest.get("generatedBy"),
            "archiveMembers": len(names),
            "totals": {
                "files": len(rows),
                "sharedLibraries": sum(row["sharedLibrary"] for row in rows),
                "pages": sum(row["pages"] for row in rows),
                "shapes": sum(row["shapes"] for row in rows),
                "components": sum(row["components"] for row in rows),
                "libraryRelations": len(relations),
            },
            "files": rows,
            "libraryRelations": relations,
        }


def record(archive, exported_on, scope, release_tag, note):
    return {
        "schemaVersion": 1,
        "exportedOn": exported_on,
        "scope": scope,
        "note": note,
        "release": "https://github.com/vllnt/ui/releases/tag/" + release_tag,
        "asset": {
            "name": archive.name,
            "bytes": archive.stat().st_size,
            "sha256": sha256_file(archive),
        },
        "inventory": inventory(archive),
    }


def verify(receipt, asset_dir):
    if receipt.get("schemaVersion") != 1:
        raise ValueError("unsupported snapshot receipt schema")
    asset = receipt["asset"]
    name = asset["name"]
    if not name or name in (".", "..") or "/" in name or "\\" in name:
        raise ValueError("asset name must be a basename")
    archive = asset_dir / name
    if archive.stat().st_size != asset["bytes"]:
        raise ValueError("archive size mismatch: " + name)
    if sha256_file(archive) != asset["sha256"]:
        raise ValueError("archive SHA-256 mismatch: " + name)
    if inventory(archive) != receipt["inventory"]:
        raise ValueError("saved inventory mismatch: " + name)
    return archive


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    commands = parser.add_subparsers(dest="command", required=True)
    create = commands.add_parser("record", help="write a new receipt; never overwrite")
    create.add_argument("archive", type=Path)
    create.add_argument("--output", type=Path, required=True)
    create.add_argument("--exported-on", required=True, help="actual export date, not receipt date")
    create.add_argument("--scope", required=True, help="explicit full/partial scope and exclusions")
    create.add_argument("--release-tag", required=True)
    create.add_argument("--note", required=True, help="qualification and restore-test limits")
    check = commands.add_parser("verify", help="check downloaded native archives against receipts")
    check.add_argument("receipts", type=Path, nargs="+")
    check.add_argument("--asset-dir", type=Path, required=True)
    args = parser.parse_args()
    try:
        if args.command == "record":
            receipt = record(args.archive, args.exported_on, args.scope, args.release_tag, args.note)
            with args.output.open("x") as stream:
                json.dump(receipt, stream, ensure_ascii=False, indent=2)
                stream.write("\n")
            print("RECORDED", args.output, json.dumps(receipt["inventory"]["totals"]))
        else:
            for path in args.receipts:
                receipt = json.loads(path.read_text())
                verified = verify(receipt, args.asset_dir)
                print("VERIFIED", verified.name, json.dumps(receipt["inventory"]["totals"]))
    except (OSError, ValueError, KeyError, TypeError, zipfile.BadZipFile) as error:
        print("FAILED:", error, file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
