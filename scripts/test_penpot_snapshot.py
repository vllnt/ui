"""Recovery checks: reject damaged/missing assets and misleading receipts."""

import copy
import json
from pathlib import Path
import struct
import subprocess
import sys
import tempfile
import unittest
import zipfile

import penpot_snapshot as snapshot


class SnapshotTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name)
        self.archive = self.root / "test.penpot"
        self.entries = {
            "manifest.json": {"type": "penpot/export-files", "version": 1, "generatedBy": "penpot/test", "files": [{"id": "f1", "name": "Kit"}], "relations": []},
            "files/f1.json": {"id": "f1", "name": "Kit", "revn": 1, "isShared": True},
            "files/f1/pages/p1.json": {"id": "p1"},
            "files/f1/pages/p1/" + snapshot.ROOT_SHAPE: {"id": "root"},
            "files/f1/pages/p1/s1.json": {"id": "s1", "type": "rect", "width": 10},
            "files/f1/components/c1.json": {"id": "c1"},
        }
        self.write_archive(self.archive)
        self.receipt = snapshot.record(self.archive, "2026-10-03", "partial test", "test", "fixture")

    def write_archive(self, path, reverse=False, compression=zipfile.ZIP_STORED):
        with zipfile.ZipFile(path, "w", compression=compression) as archive:
            for name, value in sorted(self.entries.items(), reverse=reverse):
                archive.writestr(name, json.dumps(value))

    def test_valid_archive_and_counts(self):
        self.assertEqual(snapshot.verify(self.receipt, self.root), self.archive)
        self.assertEqual(self.receipt["inventory"]["totals"], {
            "files": 1, "sharedLibraries": 1, "pages": 1, "shapes": 1,
            "components": 1, "libraryRelations": 0,
        })

    def test_missing_asset_is_rejected(self):
        self.archive.unlink()
        with self.assertRaises(FileNotFoundError):
            snapshot.verify(self.receipt, self.root)

    def test_same_size_changed_bytes_are_rejected(self):
        data = bytearray(self.archive.read_bytes())
        data[40] ^= 1
        self.archive.write_bytes(data)
        with self.assertRaisesRegex(ValueError, "SHA-256 mismatch"):
            snapshot.verify(self.receipt, self.root)

    def test_truncated_archive_is_rejected(self):
        self.archive.write_bytes(self.archive.read_bytes()[:-10])
        with self.assertRaisesRegex(ValueError, "size mismatch"):
            snapshot.verify(self.receipt, self.root)

    def test_inventory_tampering_is_rejected(self):
        self.receipt["inventory"]["totals"]["components"] = 2
        with self.assertRaisesRegex(ValueError, "inventory mismatch"):
            snapshot.verify(self.receipt, self.root)

    def test_corrupt_member_is_rejected_even_with_updated_archive_hash(self):
        with zipfile.ZipFile(self.archive) as archive:
            offset = archive.getinfo("files/f1/pages/p1/s1.json").header_offset
        data = bytearray(self.archive.read_bytes())
        name_size, extra_size = struct.unpack_from("<HH", data, offset + 26)
        data[offset + 30 + name_size + extra_size] ^= 1
        self.archive.write_bytes(data)
        self.receipt["asset"]["sha256"] = snapshot.sha256_file(self.archive)
        with self.assertRaises(zipfile.BadZipFile):
            snapshot.verify(self.receipt, self.root)

    def test_file_hash_ignores_zip_order_and_compression(self):
        other = self.root / "repacked.penpot"
        self.write_archive(other, reverse=True, compression=zipfile.ZIP_DEFLATED)
        self.assertNotEqual(snapshot.sha256_file(other), self.receipt["asset"]["sha256"])
        self.assertEqual(snapshot.inventory(other), self.receipt["inventory"])
        self.entries["files/f1/pages/p1/s1.json"]["width"] = 20
        self.write_archive(other)
        self.assertNotEqual(snapshot.inventory(other)["files"][0]["filePayloadSha256"], self.receipt["inventory"]["files"][0]["filePayloadSha256"])

    def test_dangling_library_relation_is_rejected(self):
        self.entries["manifest.json"]["relations"] = [["f1", "missing"]]
        self.write_archive(self.archive)
        with self.assertRaisesRegex(ValueError, "outside this export"):
            snapshot.inventory(self.archive)

    def test_duplicate_members_are_rejected(self):
        import warnings
        with warnings.catch_warnings():
            warnings.simplefilter("ignore", UserWarning)
            with zipfile.ZipFile(self.archive, "a") as archive:
                archive.writestr("files/f1.json", "{}")
        with self.assertRaisesRegex(ValueError, "duplicate ZIP"):
            snapshot.inventory(self.archive)

    def test_asset_cannot_escape_download_directory(self):
        for name in ["../test.penpot", "/test.penpot", "..\\test.penpot"]:
            receipt = copy.deepcopy(self.receipt)
            receipt["asset"]["name"] = name
            with self.assertRaisesRegex(ValueError, "basename"):
                snapshot.verify(receipt, self.root)

    def test_cli_round_trip_and_no_overwrite(self):
        receipt = self.root / "receipt.json"
        script = str(Path(snapshot.__file__).resolve())
        command = [sys.executable, script, "record", str(self.archive), "--output", str(receipt), "--exported-on", "2026-10-03", "--scope", "partial", "--release-tag", "test", "--note", "fixture"]
        self.assertEqual(subprocess.run(command, capture_output=True).returncode, 0)
        before = receipt.read_bytes()
        self.assertEqual(subprocess.run(command, capture_output=True).returncode, 1)
        self.assertEqual(receipt.read_bytes(), before)
        check = [sys.executable, script, "verify", str(receipt), "--asset-dir", str(self.root)]
        self.assertEqual(subprocess.run(check, capture_output=True).returncode, 0)
        self.archive.unlink()
        self.assertEqual(subprocess.run(check, capture_output=True).returncode, 1)


if __name__ == "__main__":
    unittest.main()
