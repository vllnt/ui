import { join, resolve } from "node:path";

import { assertFile, checkPackedPackage } from "../../../scripts/packed-package.mjs";

await checkPackedPackage({
  conditions: ["import", "types"],
  fields: ["main", "module", "types"],
  name: "core",
  packageDirectory: resolve(import.meta.dirname, ".."),
  async verify(manifest, packedDirectory) {
    const tokensExport = manifest.exports?.["./tokens.json"];
    const contractsExport = manifest.exports?.["./contracts.json"];
    if (tokensExport !== "./tokens.json") {
      throw new Error(`Packed tokens export is invalid: ${tokensExport}.`);
    }
    if (contractsExport !== "./component-contracts.json") {
      throw new Error(`Packed contracts export is invalid: ${contractsExport}.`);
    }
    await assertFile(join(packedDirectory, tokensExport), "tokens export");
    await assertFile(join(packedDirectory, contractsExport), "contracts export");

    console.log(
      `Packed core package resolves runtime, types, tokens, and contracts from published files (${manifest.version}).`,
    );
  },
});
