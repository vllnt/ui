import { resolve } from "node:path";

import { checkPackedPackage } from "../../../scripts/packed-package.mjs";

await checkPackedPackage({
  conditions: ["default", "import", "react-native", "types"],
  fields: ["main", "module", "react-native", "types"],
  name: "native",
  packageDirectory: resolve(import.meta.dirname, ".."),
  verify(manifest) {
    const coreRange = manifest.dependencies?.["@vllnt/ui-core"];
    if (typeof coreRange !== "string" || coreRange.startsWith("workspace:")) {
      throw new Error(`Packed @vllnt/ui-core range is invalid: ${coreRange}.`);
    }

    console.log(
      `Packed native package resolves main, module, react-native, and types from dist (${manifest.version}).`,
    );
  },
});
